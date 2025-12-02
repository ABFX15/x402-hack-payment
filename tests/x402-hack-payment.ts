import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { X402HackPayment } from "../target/types/x402_hack_payment";

describe("x402-hack-payment", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.X402HackPayment as Program<X402HackPayment>;
  const connection = provider.connection;

  const authority = provider.wallet;

  let platformConfigPDA: PublicKey;
  let platformTreasuryPDA: PublicKey;
  let usdcMint: PublicKey;
  let merchantAccountPDA: PublicKey;
  let merchantBump: number;
  const settlementWallet = Keypair.generate();

  const MERCHANT_ID = "merchant_123";

  before(async () => {
    // Derive PDAs using the correct seeds from the program
    [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId,
    );
    console.log(`\nPlatform config PDA: ${platformConfigPDA.toBase58()}`);

    [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_treasury")],
      program.programId,
    );
    console.log(`\nPlatform Treasury PDA: ${platformTreasuryPDA.toBase58()}`);

    [merchantAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), Buffer.from("merchant_123")],
      program.programId,
    );
    console.log(`\nMerchant Account PDA: ${merchantAccountPDA.toBase58()}`);

    usdcMint = await createMint(
      connection,
      authority.payer,
      authority.publicKey,
      null,
      6 // USDC has 6 decimal places
    );
    console.log(`\nUSDC Mint: ${usdcMint.toBase58()}`);
  });

  it("Platform is initialized!", async () => {
    const platformFeeBps = 250;
    const minPaymentAmount = 10000;

    const tx = await program.methods
      .setPlatformConfig(new anchor.BN(platformFeeBps), new BN(minPaymentAmount))
      .accountsStrict({
        authority: authority.publicKey,
        platformConfig: platformConfigPDA,
        platformTreasury: platformTreasuryPDA,
        usdcMint: usdcMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`Transaction signature: ${tx}`);

    const config = await program.account.platform.fetch(platformConfigPDA);
    console.log(`\nPlatform Config: ${JSON.stringify(config)}`);

    const treasuryBalance = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
    console.log(`\nTreasury Balance: ${treasuryBalance}`);
  });

  it("Merchant is initialized!", async () => {
    const merchantId = "merchant123";
    const tx = await program.methods
      .initializeMerchant(MERCHANT_ID, merchantBump)
      .accountsStrict({
        payer: authority.publicKey,
        merchantAccount: merchantAccountPDA,
        platformConfig: platformConfigPDA,
        settlementWallet: settlementWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`\nTransaction signature: ${tx}`);

    const merchantAccount = await program.account.merchant.fetch(merchantAccountPDA);
    console.log(`\nMerchant Account: ${JSON.stringify(merchantAccount)}`);
  });

  it("Processes a payment!", async () => {
    // Create a user and fund them with USDC
    const user = Keypair.generate();
    const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSig);

    // Generate unique payment ID
    const paymentId = `pay_${Date.now()}`;

    // Derive payment account PDA
    const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment"), Buffer.from(paymentId)],
      program.programId,
    );
    console.log(`\nPayment Account PDA: ${paymentAccountPDA.toBase58()}`);

    // Derive customer account PDA
    const [customerAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("customer"), user.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`\nCustomer Account PDA: ${customerAccountPDA.toBase58()}`);

    // Create user's USDC token account
    const customerUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      authority.payer,
      usdcMint,
      user.publicKey,
    );

    // Create merchant's USDC token account
    const merchantUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      authority.payer,
      usdcMint,
      settlementWallet.publicKey,
    );

    await mintTo(
      connection,
      authority.payer,
      usdcMint,
      customerUsdcAccount.address,
      authority.publicKey,
      500000, // Mint 0.5 USDC (500,000 micro USDC)
    );

    console.log(`\nCustomer USDC Account: ${customerUsdcAccount.address.toBase58()}`);
    console.log(`\nMerchant USDC Account: ${merchantUsdcAccount.address.toBase58()}`);

    // Process payment
    const paymentAmount = 20000; // 0.02 USDC
    const tx = await program.methods
      .processPayment(paymentId, new BN(paymentAmount))
      .accountsStrict({
        payer: user.publicKey,
        platformConfig: platformConfigPDA,
        paymentAccount: paymentAccountPDA,
        customerAccount: customerAccountPDA,
        merchantAccount: merchantAccountPDA,
        usdcMint: usdcMint,
        customerUsdc: customerUsdcAccount.address,
        merchantUsdc: merchantUsdcAccount.address,
        platformTreasuryUsdc: platformTreasuryPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    console.log(`\nTransaction signature: ${tx}`);

    const paymentAccount = await program.account.payment.fetch(paymentAccountPDA);
    console.log(`\nPayment Account: ${JSON.stringify(paymentAccount)}`);

    const merchantAccount = await program.account.merchant.fetch(merchantAccountPDA);
    console.log(`\nUpdated Merchant Account: ${JSON.stringify(merchantAccount)}`);

    const platformTreasuryBalance = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
    console.log(`\nPlatform Treasury Balance: ${platformTreasuryBalance}`);
  });
});
