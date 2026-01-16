/**
 * Inco Lightning Privacy Module
 * 
 * Helpers for issuing private receipts with FHE-encrypted payment amounts.
 * Only authorized parties (merchant + customer) can decrypt via Inco covalidators.
 */

import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';

/**
 * Inco Lightning Program ID (devnet)
 */
export const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
    '5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj'
);

/**
 * Settlr Program ID
 */
export const SETTLR_PROGRAM_ID = new PublicKey(
    '339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5'
);

/**
 * Derive the allowance PDA for a given handle and allowed address
 * This PDA stores the decryption permission for a specific address
 * 
 * @param handle - The u128 handle to the encrypted value (as bigint)
 * @param allowedAddress - The address being granted decryption access
 * @returns The allowance PDA and bump
 */
export function findAllowancePda(
    handle: bigint,
    allowedAddress: PublicKey
): [PublicKey, number] {
    // Convert handle to 16-byte little-endian buffer
    const handleBuffer = Buffer.alloc(16);
    let h = handle;
    for (let i = 0; i < 16; i++) {
        handleBuffer[i] = Number(h & BigInt(0xff));
        h = h >> BigInt(8);
    }

    return PublicKey.findProgramAddressSync(
        [handleBuffer, allowedAddress.toBuffer()],
        INCO_LIGHTNING_PROGRAM_ID
    );
}

/**
 * Derive the private receipt PDA for a given payment ID
 * 
 * @param paymentId - The payment ID string
 * @returns The private receipt PDA and bump
 */
export function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_receipt'), Buffer.from(paymentId)],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Encrypt an amount for Inco Lightning
 * 
 * In production, this would use the Inco encryption API to create
 * a proper FHE ciphertext. For now, this is a placeholder that
 * would be replaced with the actual Inco client library.
 * 
 * @param amount - The amount in USDC lamports (6 decimals)
 * @returns Encrypted ciphertext as Uint8Array
 */
export async function encryptAmount(amount: bigint): Promise<Uint8Array> {
    // TODO: Replace with actual Inco encryption
    // This requires the Inco client library and network key
    // For hackathon demo, we can use their test encryption endpoint

    // Placeholder: encode amount as bytes (NOT secure, just for structure)
    const buffer = Buffer.alloc(16);
    let a = amount;
    for (let i = 0; i < 16; i++) {
        buffer[i] = Number(a & BigInt(0xff));
        a = a >> BigInt(8);
    }

    return new Uint8Array(buffer);
}

/**
 * Configuration for issuing a private receipt
 */
export interface PrivateReceiptConfig {
    /** Payment ID (must be unique) */
    paymentId: string;

    /** Amount in USDC (will be converted to lamports) */
    amount: number;

    /** Customer wallet address (payer and signer) */
    customer: PublicKey;

    /** Merchant wallet address (receives decryption access) */
    merchant: PublicKey;

    /** Pre-computed encrypted amount ciphertext (optional, will encrypt if not provided) */
    encryptedAmount?: Uint8Array;
}

/**
 * Build accounts needed for issuing a private receipt
 * 
 * Note: This returns the accounts structure but the actual transaction
 * must be built using the Anchor program client with `remainingAccounts`
 * for the allowance PDAs.
 * 
 * @param config - Private receipt configuration
 * @returns Object with all required account addresses
 */
export async function buildPrivateReceiptAccounts(config: PrivateReceiptConfig) {
    const [privateReceiptPda, privateReceiptBump] = findPrivateReceiptPda(config.paymentId);

    return {
        customer: config.customer,
        merchant: config.merchant,
        privateReceipt: privateReceiptPda,
        incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bump: privateReceiptBump,
    };
}

/**
 * Simulate a transaction to get the resulting encrypted handle
 * 
 * This is needed because we need the handle to derive allowance PDAs,
 * but the handle is only known after the encryption CPI call.
 * 
 * Pattern:
 * 1. Build tx without allowance accounts
 * 2. Simulate to get the handle from account state
 * 3. Derive allowance PDAs from handle
 * 4. Execute real tx with allowance accounts in remainingAccounts
 * 
 * @param connection - Solana connection
 * @param transaction - Built transaction without allowance accounts
 * @param privateReceiptPda - The PDA where encrypted handle will be stored
 * @returns The encrypted handle as bigint, or null if simulation failed
 */
export async function simulateAndGetHandle(
    connection: any, // Connection type
    transaction: any, // Transaction type  
    privateReceiptPda: PublicKey
): Promise<bigint | null> {
    try {
        const simulation = await connection.simulateTransaction(
            transaction,
            undefined,
            [privateReceiptPda]
        );

        if (simulation.value.err) {
            console.error('Simulation failed:', simulation.value.err);
            return null;
        }

        if (simulation.value.accounts?.[0]?.data) {
            const data = Buffer.from(simulation.value.accounts[0].data[0], 'base64');

            // PrivateReceipt layout (after 8-byte discriminator):
            // - payment_id: String (4 + len bytes)
            // - customer: Pubkey (32 bytes)
            // - merchant: Pubkey (32 bytes)
            // - encrypted_amount_handle: u128 (16 bytes)

            // Skip discriminator (8) + string length (4) + string data + pubkeys (64)
            // This offset depends on actual payment_id length
            const paymentIdLen = data.readUInt32LE(8);
            const handleOffset = 8 + 4 + paymentIdLen + 32 + 32;

            // Read u128 as little-endian
            let handle = BigInt(0);
            for (let i = 15; i >= 0; i--) {
                handle = handle * BigInt(256) + BigInt(data[handleOffset + i]);
            }

            return handle;
        }

        return null;
    } catch (error) {
        console.error('Simulation error:', error);
        return null;
    }
}

/**
 * Build remaining accounts array for allowance PDAs
 * 
 * These must be passed to the instruction after deriving from the handle.
 * Since we don't know the handle until after simulation, this is called
 * after simulateAndGetHandle.
 * 
 * @param handle - The encrypted handle from simulation
 * @param customer - Customer address (granted access)
 * @param merchant - Merchant address (granted access)
 * @returns Array of remaining accounts for the instruction
 */
export function buildAllowanceRemainingAccounts(
    handle: bigint,
    customer: PublicKey,
    merchant: PublicKey
): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> {
    const [customerAllowancePda] = findAllowancePda(handle, customer);
    const [merchantAllowancePda] = findAllowancePda(handle, merchant);

    return [
        { pubkey: customerAllowancePda, isSigner: false, isWritable: true },
        { pubkey: merchantAllowancePda, isSigner: false, isWritable: true },
    ];
}

/**
 * Full flow example for issuing a private receipt
 * 
 * @example
 * ```typescript
 * import { issuePrivateReceiptFlow } from '@settlr/sdk/privacy';
 * 
 * const result = await issuePrivateReceiptFlow({
 *   connection,
 *   program, // Anchor program instance
 *   paymentId: 'payment_123',
 *   amount: 99.99,
 *   customer: customerWallet.publicKey,
 *   merchant: merchantPubkey,
 *   signTransaction: customerWallet.signTransaction,
 * });
 * 
 * console.log('Private receipt:', result.signature);
 * console.log('Handle:', result.handle.toString());
 * ```
 */
export interface IssuePrivateReceiptResult {
    /** Transaction signature */
    signature: string;

    /** Encrypted amount handle (u128 as bigint) */
    handle: bigint;

    /** Private receipt PDA address */
    privateReceiptPda: PublicKey;
}

// Type for Anchor program (avoid circular dependency)
export interface AnchorProgram {
    methods: {
        issuePrivateReceipt: (
            paymentId: string,
            encryptedAmountCiphertext: Buffer
        ) => {
            accounts: (accounts: Record<string, PublicKey>) => {
                transaction: () => Promise<any>;
                remainingAccounts: (accounts: Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }>) => {
                    rpc: () => Promise<string>;
                };
            };
        };
    };
}

/**
 * Privacy-preserving receipt features
 * 
 * Key benefits:
 * - Payment amounts hidden on-chain (only u128 handle visible)
 * - Merchant can still decrypt for accounting/tax compliance
 * - Customer can verify their payment privately
 * - Competitors can't see your revenue on-chain
 */
export const PrivacyFeatures = {
    /** Amount is FHE-encrypted, only handle stored on-chain */
    ENCRYPTED_AMOUNTS: true,

    /** Selective disclosure - only merchant + customer can decrypt */
    ACCESS_CONTROL: true,

    /** CSV export still works (decrypts server-side for authorized merchant) */
    ACCOUNTING_COMPATIBLE: true,

    /** Inco covalidators ensure trustless decryption */
    TRUSTLESS_DECRYPTION: true,
} as const;

// ============================================================================
// PRIVATE SETTLR - Confidential Commerce Extensions
// ============================================================================

/**
 * Subscription billing cycle presets
 */
export const BillingCycles = {
    /** Weekly (7 days) */
    WEEKLY: 7 * 24 * 60 * 60,
    /** Bi-weekly (14 days) */
    BIWEEKLY: 14 * 24 * 60 * 60,
    /** Monthly (30 days) */
    MONTHLY: 30 * 24 * 60 * 60,
    /** Quarterly (90 days) */
    QUARTERLY: 90 * 24 * 60 * 60,
    /** Yearly (365 days) */
    YEARLY: 365 * 24 * 60 * 60,
} as const;

/**
 * Private subscription configuration
 */
export interface PrivateSubscriptionConfig {
    /** Unique subscription ID */
    subscriptionId: string;
    /** Customer wallet address */
    customer: PublicKey;
    /** Merchant wallet address */
    merchant: PublicKey;
    /** Monthly/recurring amount in USDC */
    amount: number;
    /** Billing cycle in seconds (use BillingCycles constants) */
    billingCycleSeconds: number;
}

/**
 * Private payout configuration
 */
export interface PrivatePayoutConfig {
    /** Unique payout ID */
    payoutId: string;
    /** Merchant PDA address */
    merchant: PublicKey;
    /** Destination wallet for settlement */
    destinationWallet: PublicKey;
    /** Payout amount in USDC */
    amount: number;
    /** Optional auditor for compliance (can decrypt) */
    auditor?: PublicKey;
}

/**
 * Derive the private subscription PDA
 */
export function findPrivateSubscriptionPda(subscriptionId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_subscription'), Buffer.from(subscriptionId)],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Derive the private payout PDA
 */
export function findPrivatePayoutPda(payoutId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_payout'), Buffer.from(payoutId)],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Derive merchant private stats PDA
 */
export function findMerchantPrivateStatsPda(merchantPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('merchant_private_stats'), merchantPda.toBuffer()],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Build accounts for creating a private subscription
 */
export async function buildPrivateSubscriptionAccounts(config: PrivateSubscriptionConfig) {
    const [subscriptionPda, subscriptionBump] = findPrivateSubscriptionPda(config.subscriptionId);

    return {
        customer: config.customer,
        merchant: config.merchant,
        privateSubscription: subscriptionPda,
        systemProgram: SystemProgram.programId,
        bump: subscriptionBump,
    };
}

/**
 * Build accounts for initiating a private payout
 */
export async function buildPrivatePayoutAccounts(config: PrivatePayoutConfig) {
    const [payoutPda, payoutBump] = findPrivatePayoutPda(config.payoutId);
    const [statsPda, statsBump] = findMerchantPrivateStatsPda(config.merchant);

    return {
        merchant: config.merchant,
        privatePayout: payoutPda,
        merchantPrivateStats: statsPda,
        destinationWallet: config.destinationWallet,
        systemProgram: SystemProgram.programId,
        payoutBump,
        statsBump,
    };
}

/**
 * Privacy mode options for merchant dashboard
 */
export interface PrivacyModeConfig {
    /** When true, individual transaction amounts are hidden */
    hideIndividualAmounts: boolean;
    /** When true, only show aggregate totals (encrypted sum) */
    aggregatesOnly: boolean;
    /** Allow on-demand decryption for specific transactions */
    allowSelectiveDecryption: boolean;
}

/**
 * Default privacy mode (maximum privacy)
 */
export const DEFAULT_PRIVACY_MODE: PrivacyModeConfig = {
    hideIndividualAmounts: true,
    aggregatesOnly: true,
    allowSelectiveDecryption: true,
};

/**
 * Aggregate data returned from private dashboard
 * Individual amounts remain encrypted; only counts are public
 */
export interface PrivateDashboardData {
    /** Encrypted total revenue handle (decrypt with merchant key) */
    encryptedTotalRevenueHandle: bigint;
    /** Encrypted total payouts handle */
    encryptedTotalPayoutsHandle: bigint;
    /** Total transaction count (can be public or private) */
    transactionCount: number;
    /** Total payout count */
    payoutCount: number;
    /** Active subscription count */
    activeSubscriptionCount: number;
    /** Last updated timestamp */
    lastUpdated: Date;
}

/**
 * Generate a unique subscription ID
 */
export function generateSubscriptionId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'sub_';
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Generate a unique payout ID
 */
export function generatePayoutId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'payout_';
    for (let i = 0; i < 12; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

