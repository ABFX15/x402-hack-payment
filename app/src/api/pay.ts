import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { loadOctaneConfig, TokenFee } from '../sdk/octane'; 

const connection = new Connection(process.env.RPC_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET: Return metadata (required by Solana Pay spec)
    if (req.method === 'GET') {
        return res.json({
            label: 'Your Payment App',
            icon: 'https://yourapp.com/icon.png',
        });
    }

    // POST: Build and return the transaction
    if (req.method === 'POST') {
        try {
            const { account } = req.body;  // Wallet sends payer's public key
            const { orderId, amount, mint } = req.query;

            const payer = new PublicKey(account);
            const mintPubkey = new PublicKey(mint as string);
            const amountNumber = parseFloat(amount as string);

            // Load your merchant config (from DB, etc.)
            const merchantWallet = new PublicKey(process.env.MERCHANT_WALLET!);

            // Load Octane config
            const octaneConfig = await loadOctaneConfig();
            const feePayer = new PublicKey(octaneConfig.feePayer);

            // Find the fee token config for this mint
            const feeToken = octaneConfig.endpoints.transfer.tokens.find(
                t => t.mint === mint
            );
            if (!feeToken) {
                return res.status(400).json({ error: 'Token not supported' });
            }

            // Generate a unique reference for this payment
            const reference = Keypair.generate().publicKey;

            // Build the transaction with Octane fee
            const transaction = await buildPaymentTransaction(
                connection,
                feePayer,
                feeToken,
                mintPubkey,
                payer,
                merchantWallet,
                amountNumber,
                reference,
            );

            // Serialize (without signatures - wallet will sign)
            const serialized = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            });

            // Store reference -> orderId mapping for verification
            await storePaymentReference(reference.toBase58(), orderId as string);

            return res.json({
                transaction: Buffer.from(serialized).toString('base64'),
                message: `Payment of ${amount} for order ${orderId}`,
            });

        } catch (error) {
            console.error('Payment error:', error);
            return res.status(500).json({ error: 'Failed to create transaction' });
        }
    }
}

async function buildPaymentTransaction(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    merchant: PublicKey,
    amount: number,
    reference: PublicKey,
): Promise<Transaction> {
    const senderAta = await getAssociatedTokenAddress(mint, sender);
    const merchantAta = await getAssociatedTokenAddress(mint, merchant);

    const amountInSmallestUnit = amount * Math.pow(10, fee.decimals);

    // Octane fee instruction
    const feeIx = createTransferInstruction(
        senderAta,
        new PublicKey(fee.account),
        sender,
        fee.fee
    );

    // Actual payment instruction with reference for tracking
    const paymentIx = createTransferInstruction(
        senderAta,
        merchantAta,
        sender,
        amountInSmallestUnit
    );
    // Add reference key so we can find this transaction later
    paymentIx.keys.push({
        pubkey: reference,
        isSigner: false,
        isWritable: false,
    });

    const { blockhash } = await connection.getLatestBlockhash();

    return new Transaction({
        recentBlockhash: blockhash,
        feePayer: feePayer,  // Octane pays
    }).add(feeIx, paymentIx);
}

async function storePaymentReference(reference: string, orderId: string): Promise<void> {
    // Store in  DB - Redis, Postgres, etc.
}