/**
 * Update Platform Config
 * 
 * Run with: npx ts-node scripts/update-platform-fee.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { X402HackPayment } from "../target/types/x402_hack_payment";

async function main() {
    // Configure provider from environment
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.X402HackPayment as Program<X402HackPayment>;

    // Platform fee: 200 bps = 2%
    const NEW_FEE_BPS = 200;

    // Minimum payment: 10000 = 0.01 USDC (6 decimals)
    const MIN_PAYMENT_AMOUNT = 10000;

    // USDC Devnet mint
    const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

    // Derive PDAs
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        program.programId
    );

    const [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        program.programId
    );

    console.log("=== Update Platform Config ===");
    console.log(`Program ID: ${program.programId.toBase58()}`);
    console.log(`Platform Config PDA: ${platformConfigPDA.toBase58()}`);
    console.log(`Platform Treasury PDA: ${platformTreasuryPDA.toBase58()}`);
    console.log(`New Fee: ${NEW_FEE_BPS} bps (${NEW_FEE_BPS / 100}%)`);
    console.log(`Min Payment: ${MIN_PAYMENT_AMOUNT} (${MIN_PAYMENT_AMOUNT / 1_000_000} USDC)`);
    console.log("");

    try {
        const tx = await program.methods
            .setPlatformConfig(
                new anchor.BN(NEW_FEE_BPS),
                new anchor.BN(MIN_PAYMENT_AMOUNT)
            )
            .accountsStrict({
                authority: provider.wallet.publicKey,
                platformConfig: platformConfigPDA,
                platformTreasury: platformTreasuryPDA,
                usdcMint: USDC_MINT,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        console.log(`✅ Platform config updated!`);
        console.log(`Transaction: ${tx}`);
        console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

        // Fetch and display the updated config
        const config = await program.account.platform.fetch(platformConfigPDA);
        console.log("");
        console.log("Updated Platform Config:");
        console.log(`  Fee: ${config.feeBps.toString()} bps (${Number(config.feeBps) / 100}%)`);
        console.log(`  Min Payment: ${config.minPaymentAmount.toString()}`);
        console.log(`  Authority: ${config.authority.toBase58()}`);

    } catch (error) {
        console.error("Error updating platform config:", error);
        process.exit(1);
    }
}

main().then(() => process.exit(0));
