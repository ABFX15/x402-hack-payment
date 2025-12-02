import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { X402HackPayment } from "./x402_hack_payment";
import idl from "./x402_hack_payment.json";// Program ID from the IDL
export const PROGRAM_ID = new PublicKey(
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
);

// Devnet USDC mint
export const USDC_MINT = new PublicKey(
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

// PDA Seeds
const PLATFORM_CONFIG_SEED = Buffer.from("platform_config");
const PLATFORM_TREASURY_SEED = Buffer.from("platform_treasury");
const MERCHANT_SEED = Buffer.from("merchant");
const CUSTOMER_SEED = Buffer.from("customer");
const PAYMENT_SEED = Buffer.from("payment");

// Derive PDAs
export function getPlatformConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([PLATFORM_CONFIG_SEED], PROGRAM_ID);
}

export function getPlatformTreasuryPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([PLATFORM_TREASURY_SEED], PROGRAM_ID);
}

export function getMerchantPDA(merchantId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [MERCHANT_SEED, Buffer.from(merchantId)],
        PROGRAM_ID
    );
}

export function getCustomerPDA(customerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [CUSTOMER_SEED, customerPubkey.toBuffer()],
        PROGRAM_ID
    );
}

export function getPaymentPDA(paymentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [PAYMENT_SEED, Buffer.from(paymentId)],
        PROGRAM_ID
    );
}

// Types for accounts
export interface PlatformConfig {
    authority: PublicKey;
    feeBps: number;
    minPaymentAmount: BN;
    isActive: boolean;
    totalVolume: BN;
    totalFees: BN;
    usdcMint: PublicKey;
    bump: number;
    treasuryBump: number;
}

export interface Merchant {
    merchantId: string;
    settlementWallet: PublicKey;
    feeBps: number;
    isActive: boolean;
    volume: BN;
    transactionCount: BN;
    totalFees: BN;
    createdAt: BN;
    bump: number;
}

export interface Customer {
    customer: PublicKey;
    totalSpent: BN;
    transactionCount: BN;
    createdAt: BN;
    bump: number;
}

export interface Payment {
    paymentId: string;
    payer: PublicKey;
    merchant: PublicKey;
    amount: BN;
    fee: BN;
    status: { pending: {} } | { completed: {} } | { refunded: {} };
    createdAt: BN;
    bump: number;
}

export class X402PaymentClient {
    program: Program<X402HackPayment>;
    connection: Connection;

    constructor(connection: Connection, wallet: AnchorProvider["wallet"]) {
        const provider = new AnchorProvider(connection, wallet, {
            commitment: "confirmed",
        });
        this.program = new Program(idl as unknown as X402HackPayment, provider);
        this.connection = connection;
    }    // Fetch platform config
    async getPlatformConfig(): Promise<PlatformConfig | null> {
        try {
            const [platformConfigPDA] = getPlatformConfigPDA();
            const account = await this.program.account.platform.fetch(
                platformConfigPDA
            );
            return account as unknown as PlatformConfig;
        } catch {
            return null;
        }
    }

    // Fetch merchant account
    async getMerchant(merchantId: string): Promise<Merchant | null> {
        try {
            const [merchantPDA] = getMerchantPDA(merchantId);
            const account = await this.program.account.merchant.fetch(merchantPDA);
            return account as unknown as Merchant;
        } catch {
            return null;
        }
    }

    // Fetch customer account
    async getCustomer(customerPubkey: PublicKey): Promise<Customer | null> {
        try {
            const [customerPDA] = getCustomerPDA(customerPubkey);
            const account = await this.program.account.customer.fetch(customerPDA);
            return account as unknown as Customer;
        } catch {
            return null;
        }
    }

    // Fetch payment
    async getPayment(paymentId: string): Promise<Payment | null> {
        try {
            const [paymentPDA] = getPaymentPDA(paymentId);
            const account = await this.program.account.payment.fetch(paymentPDA);
            return account as unknown as Payment;
        } catch {
            return null;
        }
    }

    // Process payment through the Anchor program
    async processPayment(
        merchantId: string,
        paymentId: string,
        amount: number // in USDC (6 decimals raw)
    ): Promise<string> {
        const [platformConfigPDA] = getPlatformConfigPDA();
        const [platformTreasuryPDA] = getPlatformTreasuryPDA();
        const [merchantPDA] = getMerchantPDA(merchantId);
        const [paymentPDA] = getPaymentPDA(paymentId);
        const payer = this.program.provider.publicKey!;
        const [customerPDA] = getCustomerPDA(payer);

        // Get merchant to find settlement wallet
        const merchant = await this.getMerchant(merchantId);
        if (!merchant) {
            throw new Error("Merchant not found");
        }

        // Get ATAs
        const customerUsdc = getAssociatedTokenAddressSync(USDC_MINT, payer);
        const merchantUsdc = getAssociatedTokenAddressSync(
            USDC_MINT,
            merchant.settlementWallet
        );

        const tx = await this.program.methods
            .processPayment(paymentId, new BN(amount))
            .accounts({
                payer,
                platformConfig: platformConfigPDA,
                paymentAccount: paymentPDA,
                customerAccount: customerPDA,
                merchantAccount: merchantPDA,
                usdcMint: USDC_MINT,
                customerUsdc,
                merchantUsdc,
                platformTreasuryUsdc: platformTreasuryPDA,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        return tx;
    }

    // Initialize merchant (for merchant registration)
    async initializeMerchant(
        merchantId: string,
        settlementWallet: PublicKey,
        feeBps: number = 0
    ): Promise<string> {
        const [platformConfigPDA] = getPlatformConfigPDA();
        const [merchantPDA] = getMerchantPDA(merchantId);
        const payer = this.program.provider.publicKey!;

        const tx = await this.program.methods
            .initializeMerchant(merchantId, feeBps)
            .accounts({
                payer,
                merchantAccount: merchantPDA,
                platformConfig: platformConfigPDA,
                settlementWallet,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        return tx;
    }

    // Request refund
    async refundPayment(paymentId: string): Promise<string> {
        const [platformConfigPDA] = getPlatformConfigPDA();
        const [platformTreasuryPDA] = getPlatformTreasuryPDA();
        const [paymentPDA] = getPaymentPDA(paymentId);

        const payment = await this.getPayment(paymentId);
        if (!payment) {
            throw new Error("Payment not found");
        }

        const merchant = await this.program.account.merchant.fetch(payment.merchant);
        const merchantAccount = merchant as unknown as Merchant;

        const [merchantPDA] = getMerchantPDA(merchantAccount.merchantId);
        const merchantUsdc = getAssociatedTokenAddressSync(
            USDC_MINT,
            merchantAccount.settlementWallet
        );
        const payerUsdc = getAssociatedTokenAddressSync(USDC_MINT, payment.payer);

        const tx = await this.program.methods
            .refundPayment()
            .accounts({
                merchantAuthority: this.program.provider.publicKey!,
                platformConfig: platformConfigPDA,
                paymentAccount: paymentPDA,
                merchantAccount: merchantPDA,
                usdcMint: USDC_MINT,
                merchantUsdc,
                payerUsdc,
                platformTreasuryUsdc: platformTreasuryPDA,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        return tx;
    }

    // Calculate fee for an amount
    async calculateFee(amount: number): Promise<{ fee: number; merchantAmount: number }> {
        const platformConfig = await this.getPlatformConfig();
        const feeBps = platformConfig?.feeBps || 100; // Default 1%

        const fee = Math.floor((amount * feeBps) / 10000);
        const merchantAmount = amount - fee;

        return { fee, merchantAmount };
    }
}

// Generate unique payment ID
export function generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `pay_${timestamp}_${random}`;
}
