import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    TokenAccountNotFoundError,
} from '@solana/spl-token';

import {
    USDC_MINT_DEVNET,
    USDC_MINT_MAINNET,
    SETTLR_CHECKOUT_URL,
    DEFAULT_RPC_ENDPOINTS,
    type SupportedNetwork,
} from './constants';
import type {
    CreatePaymentOptions,
    Payment,
    PaymentResult,
    MerchantConfig,
    TransactionOptions,
} from './types';
import {
    parseUSDC,
    generatePaymentId,
    isValidSolanaAddress,
    retry,
} from './utils';

/**
 * Settlr SDK configuration
 */
export interface SettlrConfig {
    /** Merchant configuration */
    merchant: MerchantConfig;

    /** Network to use (default: devnet) */
    network?: SupportedNetwork;

    /** Custom RPC endpoint */
    rpcEndpoint?: string;

    /** Settlr API key (for hosted features) */
    apiKey?: string;

    /** Use testnet/sandbox mode */
    testMode?: boolean;
}

/**
 * Settlr SDK Client
 * 
 * @example
 * ```typescript
 * const settlr = new Settlr({
 *   merchant: {
 *     name: 'My Store',
 *     walletAddress: 'YOUR_WALLET_ADDRESS',
 *   },
 * });
 * 
 * const payment = await settlr.createPayment({
 *   amount: 29.99,
 *   memo: 'Premium subscription',
 * });
 * 
 * // Redirect customer to checkout
 * window.location.href = payment.checkoutUrl;
 * ```
 */
export class Settlr {
    private config: Required<Omit<SettlrConfig, 'apiKey'>> & { apiKey?: string };
    private connection: Connection;
    private usdcMint: PublicKey;
    private merchantWallet: PublicKey;

    constructor(config: SettlrConfig) {
        // Validate merchant address
        const walletAddress = typeof config.merchant.walletAddress === 'string'
            ? config.merchant.walletAddress
            : config.merchant.walletAddress.toBase58();

        if (!isValidSolanaAddress(walletAddress)) {
            throw new Error('Invalid merchant wallet address');
        }

        const network = config.network ?? 'devnet';
        const testMode = config.testMode ?? (network === 'devnet');

        this.config = {
            merchant: {
                ...config.merchant,
                walletAddress,
            },
            network,
            rpcEndpoint: config.rpcEndpoint ?? DEFAULT_RPC_ENDPOINTS[network],
            apiKey: config.apiKey,
            testMode,
        };

        this.connection = new Connection(this.config.rpcEndpoint, 'confirmed');
        this.usdcMint = network === 'devnet' ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
        this.merchantWallet = new PublicKey(walletAddress);
    }

    /**
     * Create a payment link
     * 
     * @example
     * ```typescript
     * const payment = await settlr.createPayment({
     *   amount: 29.99,
     *   memo: 'Order #1234',
     *   successUrl: 'https://mystore.com/success',
     * });
     * 
     * console.log(payment.checkoutUrl);
     * // https://settlr.dev/pay?amount=29.99&merchant=...
     * ```
     */
    async createPayment(options: CreatePaymentOptions): Promise<Payment> {
        const { amount, memo, orderId, metadata, successUrl, cancelUrl, expiresIn = 3600 } = options;

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const paymentId = generatePaymentId();
        const amountLamports = parseUSDC(amount);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + expiresIn * 1000);

        // Build checkout URL
        const baseUrl = this.config.testMode
            ? SETTLR_CHECKOUT_URL.development
            : SETTLR_CHECKOUT_URL.production;

        const params = new URLSearchParams({
            amount: amount.toString(),
            merchant: this.config.merchant.name,
            to: this.config.merchant.walletAddress as string,
        });

        if (memo) params.set('memo', memo);
        if (orderId) params.set('orderId', orderId);
        if (successUrl) params.set('successUrl', successUrl);
        if (cancelUrl) params.set('cancelUrl', cancelUrl);
        if (paymentId) params.set('paymentId', paymentId);

        const checkoutUrl = `${baseUrl}?${params.toString()}`;

        // Generate QR code (simple data URL for now)
        const qrCode = await this.generateQRCode(checkoutUrl);

        const payment: Payment = {
            id: paymentId,
            amount,
            amountLamports,
            status: 'pending',
            merchantAddress: this.config.merchant.walletAddress as string,
            checkoutUrl,
            qrCode,
            memo,
            orderId,
            metadata,
            createdAt,
            expiresAt,
        };

        return payment;
    }

    /**
     * Build a transaction for direct payment (for wallet integration)
     * 
     * @example
     * ```typescript
     * const tx = await settlr.buildTransaction({
     *   payerPublicKey: wallet.publicKey,
     *   amount: 29.99,
     * });
     * 
     * const signature = await wallet.sendTransaction(tx, connection);
     * ```
     */
    async buildTransaction(options: {
        payerPublicKey: PublicKey;
        amount: number;
        memo?: string;
    }): Promise<Transaction> {
        const { payerPublicKey, amount, memo } = options;
        const amountLamports = parseUSDC(amount);

        // Get ATAs
        const payerAta = await getAssociatedTokenAddress(this.usdcMint, payerPublicKey);
        const merchantAta = await getAssociatedTokenAddress(this.usdcMint, this.merchantWallet);

        const instructions: TransactionInstruction[] = [];

        // Check if merchant ATA exists, create if not
        try {
            await getAccount(this.connection, merchantAta);
        } catch (error) {
            if (error instanceof TokenAccountNotFoundError) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        payerPublicKey,
                        merchantAta,
                        this.merchantWallet,
                        this.usdcMint
                    )
                );
            } else {
                throw error;
            }
        }

        // Add transfer instruction
        instructions.push(
            createTransferInstruction(
                payerAta,
                merchantAta,
                payerPublicKey,
                BigInt(amountLamports)
            )
        );

        // Add memo if provided
        if (memo) {
            const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
            instructions.push(
                new TransactionInstruction({
                    keys: [{ pubkey: payerPublicKey, isSigner: true, isWritable: false }],
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(memo, 'utf-8'),
                })
            );
        }

        // Build transaction
        const { blockhash } = await this.connection.getLatestBlockhash();
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payerPublicKey;

        transaction.add(...instructions);

        return transaction;
    }

    /**
     * Execute a direct payment (requires wallet adapter)
     * 
     * @example
     * ```typescript
     * const result = await settlr.pay({
     *   wallet,
     *   amount: 29.99,
     *   memo: 'Order #1234',
     * });
     * 
     * if (result.success) {
     *   console.log('Paid!', result.signature);
     * }
     * ```
     */
    async pay(options: {
        wallet: {
            publicKey: PublicKey;
            signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        amount: number;
        memo?: string;
        txOptions?: TransactionOptions;
    }): Promise<PaymentResult> {
        const { wallet, amount, memo, txOptions } = options;

        try {
            // Build transaction
            const transaction = await this.buildTransaction({
                payerPublicKey: wallet.publicKey,
                amount,
                memo,
            });

            // Sign transaction
            const signedTx = await wallet.signTransaction(transaction);

            // Send transaction
            const signature = await retry(
                () => this.connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: txOptions?.skipPreflight ?? false,
                    preflightCommitment: txOptions?.commitment ?? 'confirmed',
                    maxRetries: txOptions?.maxRetries ?? 3,
                }),
                3
            );

            // Confirm transaction
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            await this.connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature,
            });

            return {
                success: true,
                signature,
                amount,
                merchantAddress: this.merchantWallet.toBase58(),
            };
        } catch (error) {
            return {
                success: false,
                signature: '',
                amount,
                merchantAddress: this.merchantWallet.toBase58(),
                error: error instanceof Error ? error.message : 'Payment failed',
            };
        }
    }

    /**
     * Check payment status by transaction signature
     */
    async getPaymentStatus(signature: string): Promise<'pending' | 'completed' | 'failed'> {
        try {
            const status = await this.connection.getSignatureStatus(signature);

            if (!status.value) {
                return 'pending';
            }

            if (status.value.err) {
                return 'failed';
            }

            if (status.value.confirmationStatus === 'confirmed' ||
                status.value.confirmationStatus === 'finalized') {
                return 'completed';
            }

            return 'pending';
        } catch {
            return 'failed';
        }
    }

    /**
     * Create a hosted checkout session (like Stripe Checkout)
     * 
     * @example
     * ```typescript
     * const session = await settlr.createCheckoutSession({
     *   amount: 29.99,
     *   description: 'Premium Plan',
     *   successUrl: 'https://mystore.com/success',
     *   cancelUrl: 'https://mystore.com/cancel',
     *   webhookUrl: 'https://mystore.com/api/webhooks/settlr',
     * });
     * 
     * // Redirect customer to hosted checkout
     * window.location.href = session.url;
     * ```
     */
    async createCheckoutSession(options: {
        amount: number;
        description?: string;
        metadata?: Record<string, string>;
        successUrl: string;
        cancelUrl: string;
        webhookUrl?: string;
    }): Promise<{
        id: string;
        url: string;
        expiresAt: number;
    }> {
        const { amount, description, metadata, successUrl, cancelUrl, webhookUrl } = options;

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const baseUrl = this.config.testMode
            ? 'http://localhost:3000'
            : 'https://settlr.dev';

        const response = await fetch(`${baseUrl}/api/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
            },
            body: JSON.stringify({
                merchantId: this.config.merchant.name.toLowerCase().replace(/\s+/g, '-'),
                merchantName: this.config.merchant.name,
                merchantWallet: this.config.merchant.walletAddress,
                amount,
                description,
                metadata,
                successUrl,
                cancelUrl,
                webhookUrl,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || 'Failed to create checkout session');
        }

        return response.json();
    }

    /**
     * Get merchant's USDC balance
     */
    async getMerchantBalance(): Promise<number> {
        try {
            const ata = await getAssociatedTokenAddress(this.usdcMint, this.merchantWallet);
            const account = await getAccount(this.connection, ata);
            return Number(account.amount) / 1_000_000;
        } catch {
            return 0;
        }
    }

    /**
     * Generate QR code for payment URL
     */
    private async generateQRCode(url: string): Promise<string> {
        // Simple QR code placeholder - in production, use a proper QR library
        // For now, return a data URL that represents the URL
        const encoded = encodeURIComponent(url);
        return `data:image/svg+xml,${encoded}`;
    }

    /**
     * Get the connection instance
     */
    getConnection(): Connection {
        return this.connection;
    }

    /**
     * Get merchant wallet address
     */
    getMerchantAddress(): PublicKey {
        return this.merchantWallet;
    }

    /**
     * Get USDC mint address
     */
    getUsdcMint(): PublicKey {
        return this.usdcMint;
    }
}
