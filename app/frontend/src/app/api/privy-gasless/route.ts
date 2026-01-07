import { NextRequest, NextResponse } from "next/server";
import {
    getPrivyClient,
    isPrivyGaslessEnabled,
    getFeePayerWalletId,
} from "@/lib/privy-server";
import {
    Connection,
    PublicKey,
    Transaction,
    VersionedTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    getAccount,
} from "@solana/spl-token";

const RPC_ENDPOINT =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

// USDC mint address (devnet)
const USDC_MINT = new PublicKey(
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

/**
 * GET /api/privy-gasless
 *
 * Returns gasless configuration status
 */
export async function GET() {
    try {
        const enabled = isPrivyGaslessEnabled();

        if (!enabled) {
            return NextResponse.json({
                enabled: false,
                message:
                    "Privy gasless not configured. Set PRIVY_APP_SECRET and PRIVY_FEE_PAYER_WALLET_ID.",
            });
        }

        const feePayerWalletId = getFeePayerWalletId();
        const client = getPrivyClient();

        // Get fee payer wallet info
        const feePayerWallet = await client.walletApi.getWallet({
            id: feePayerWalletId!,
        });

        return NextResponse.json({
            enabled: true,
            feePayer: feePayerWallet.address,
        });
    } catch (error) {
        console.error("Privy gasless config error:", error);
        return NextResponse.json(
            { enabled: false, error: "Failed to initialize Privy gasless" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/privy-gasless
 *
 * Create and sponsor a USDC transfer transaction
 */
export async function POST(req: NextRequest) {
    try {
        if (!isPrivyGaslessEnabled()) {
            return NextResponse.json(
                { error: "Privy gasless not configured" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { action, amount, source, destination, walletId, transaction } = body;

        const client = getPrivyClient();
        const connection = new Connection(RPC_ENDPOINT, "confirmed");

        switch (action) {
            case "transfer": {
                // Create a USDC transfer transaction
                if (!amount || !source || !destination) {
                    return NextResponse.json(
                        { error: "Missing amount, source, or destination" },
                        { status: 400 }
                    );
                }

                const sourcePubkey = new PublicKey(source);
                const destinationPubkey = new PublicKey(destination);
                const sourceAta = await getAssociatedTokenAddress(
                    USDC_MINT,
                    sourcePubkey
                );
                const destinationAta = await getAssociatedTokenAddress(
                    USDC_MINT,
                    destinationPubkey
                );

                const tx = new Transaction();

                // Check if destination ATA exists
                try {
                    await getAccount(connection, destinationAta);
                } catch {
                    // Create ATA for destination
                    tx.add(
                        createAssociatedTokenAccountInstruction(
                            sourcePubkey, // payer
                            destinationAta,
                            destinationPubkey,
                            USDC_MINT
                        )
                    );
                }

                // Add transfer instruction
                tx.add(
                    createTransferInstruction(
                        sourceAta,
                        destinationAta,
                        sourcePubkey,
                        BigInt(amount) // amount in base units
                    )
                );

                // Get recent blockhash
                const { blockhash, lastValidBlockHeight } =
                    await connection.getLatestBlockhash();
                tx.recentBlockhash = blockhash;
                tx.feePayer = sourcePubkey;

                // Serialize for client signing
                const serialized = tx
                    .serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    })
                    .toString("base64");

                return NextResponse.json({
                    transaction: serialized,
                    blockhash,
                    lastValidBlockHeight,
                });
            }

            case "signAndSend": {
                // Sign a user-signed transaction with the fee payer and broadcast
                if (!walletId || !transaction) {
                    return NextResponse.json(
                        { error: "Missing walletId or transaction" },
                        { status: 400 }
                    );
                }

                // Deserialize the transaction
                const txBytes = Buffer.from(transaction, "base64");
                let tx: Transaction | VersionedTransaction;

                try {
                    tx = VersionedTransaction.deserialize(txBytes);
                } catch {
                    tx = Transaction.from(txBytes);
                }

                // Get the user's wallet info
                const wallet = await client.walletApi.getWallet({ id: walletId });

                // Sign and send with gas sponsorship
                const result = await client.walletApi.solana.signAndSendTransaction({
                    address: wallet.address,
                    chainType: "solana",
                    transaction: tx,
                    caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // devnet
                    sponsor: true, // Enable gas sponsorship!
                });

                return NextResponse.json({
                    signature: result.hash,
                    caip2: result.caip2,
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Privy gasless API error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Privy gasless operation failed",
            },
            { status: 500 }
        );
    }
}
