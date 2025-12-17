"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SETTLR_CHECKOUT_URL: () => SETTLR_CHECKOUT_URL,
  SUPPORTED_NETWORKS: () => SUPPORTED_NETWORKS,
  Settlr: () => Settlr,
  SettlrProvider: () => SettlrProvider,
  USDC_MINT_DEVNET: () => USDC_MINT_DEVNET,
  USDC_MINT_MAINNET: () => USDC_MINT_MAINNET,
  formatUSDC: () => formatUSDC,
  parseUSDC: () => parseUSDC,
  shortenAddress: () => shortenAddress,
  useSettlr: () => useSettlr
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_web32 = require("@solana/web3.js");
var import_spl_token = require("@solana/spl-token");

// src/constants.ts
var import_web3 = require("@solana/web3.js");
var USDC_MINT_DEVNET = new import_web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
var USDC_MINT_MAINNET = new import_web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
var SETTLR_API_URL = {
  production: "https://settlr.dev/api",
  development: "http://localhost:3000/api"
};
var SETTLR_CHECKOUT_URL = {
  production: "https://settlr.dev/pay",
  development: "http://localhost:3000/pay"
};
var SUPPORTED_NETWORKS = ["devnet", "mainnet-beta"];
var USDC_DECIMALS = 6;
var DEFAULT_RPC_ENDPOINTS = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com"
};

// src/utils.ts
function formatUSDC(lamports, decimals = 2) {
  const amount = Number(lamports) / Math.pow(10, USDC_DECIMALS);
  return amount.toFixed(decimals);
}
function parseUSDC(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.round(num * Math.pow(10, USDC_DECIMALS)));
}
function shortenAddress(address, chars = 4) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
function generatePaymentId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `pay_${timestamp}${random}`;
}
function isValidSolanaAddress(address) {
  try {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retry(fn, maxRetries = 3, baseDelay = 1e3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

// src/client.ts
var Settlr = class {
  constructor(config) {
    this.validated = false;
    if (!config.apiKey) {
      throw new Error("API key is required. Get one at https://settlr.dev/dashboard");
    }
    const walletAddress = typeof config.merchant.walletAddress === "string" ? config.merchant.walletAddress : config.merchant.walletAddress.toBase58();
    if (!isValidSolanaAddress(walletAddress)) {
      throw new Error("Invalid merchant wallet address");
    }
    const network = config.network ?? "devnet";
    const testMode = config.testMode ?? network === "devnet";
    this.config = {
      merchant: {
        ...config.merchant,
        walletAddress
      },
      apiKey: config.apiKey,
      network,
      rpcEndpoint: config.rpcEndpoint ?? DEFAULT_RPC_ENDPOINTS[network],
      testMode
    };
    this.apiBaseUrl = testMode ? SETTLR_API_URL.development : SETTLR_API_URL.production;
    this.connection = new import_web32.Connection(this.config.rpcEndpoint, "confirmed");
    this.usdcMint = network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
    this.merchantWallet = new import_web32.PublicKey(walletAddress);
  }
  /**
   * Validate API key with Settlr backend
   */
  async validateApiKey() {
    if (this.validated) return;
    try {
      const response = await fetch(`${this.apiBaseUrl}/sdk/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey
        },
        body: JSON.stringify({
          walletAddress: this.config.merchant.walletAddress
        })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Invalid API key" }));
        throw new Error(error.error || "API key validation failed");
      }
      const data = await response.json();
      if (!data.valid) {
        throw new Error(data.error || "Invalid API key");
      }
      this.validated = true;
      this.merchantId = data.merchantId;
      this.tier = data.tier;
    } catch (error) {
      if (error instanceof Error && error.message.includes("fetch")) {
        if (this.config.apiKey.startsWith("sk_test_")) {
          this.validated = true;
          this.tier = "free";
          return;
        }
      }
      throw error;
    }
  }
  /**
   * Get the current tier
   */
  getTier() {
    return this.tier;
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
  async createPayment(options) {
    await this.validateApiKey();
    const { amount, memo, orderId, metadata, successUrl, cancelUrl, expiresIn = 3600 } = options;
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    const paymentId = generatePaymentId();
    const amountLamports = parseUSDC(amount);
    const createdAt = /* @__PURE__ */ new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresIn * 1e3);
    const baseUrl = this.config.testMode ? SETTLR_CHECKOUT_URL.development : SETTLR_CHECKOUT_URL.production;
    const params = new URLSearchParams({
      amount: amount.toString(),
      merchant: this.config.merchant.name,
      to: this.config.merchant.walletAddress
    });
    if (memo) params.set("memo", memo);
    if (orderId) params.set("orderId", orderId);
    if (successUrl) params.set("successUrl", successUrl);
    if (cancelUrl) params.set("cancelUrl", cancelUrl);
    if (paymentId) params.set("paymentId", paymentId);
    const checkoutUrl = `${baseUrl}?${params.toString()}`;
    const qrCode = await this.generateQRCode(checkoutUrl);
    const payment = {
      id: paymentId,
      amount,
      amountLamports,
      status: "pending",
      merchantAddress: this.config.merchant.walletAddress,
      checkoutUrl,
      qrCode,
      memo,
      orderId,
      metadata,
      createdAt,
      expiresAt
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
  async buildTransaction(options) {
    await this.validateApiKey();
    const { payerPublicKey, amount, memo } = options;
    const amountLamports = parseUSDC(amount);
    const payerAta = await (0, import_spl_token.getAssociatedTokenAddress)(this.usdcMint, payerPublicKey);
    const merchantAta = await (0, import_spl_token.getAssociatedTokenAddress)(this.usdcMint, this.merchantWallet);
    const instructions = [];
    try {
      await (0, import_spl_token.getAccount)(this.connection, merchantAta);
    } catch (error) {
      if (error instanceof import_spl_token.TokenAccountNotFoundError) {
        instructions.push(
          (0, import_spl_token.createAssociatedTokenAccountInstruction)(
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
    instructions.push(
      (0, import_spl_token.createTransferInstruction)(
        payerAta,
        merchantAta,
        payerPublicKey,
        BigInt(amountLamports)
      )
    );
    if (memo) {
      const MEMO_PROGRAM_ID = new import_web32.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      instructions.push(
        new import_web32.TransactionInstruction({
          keys: [{ pubkey: payerPublicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf-8")
        })
      );
    }
    const { blockhash } = await this.connection.getLatestBlockhash();
    const transaction = new import_web32.Transaction();
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
  async pay(options) {
    const { wallet, amount, memo, txOptions } = options;
    try {
      const transaction = await this.buildTransaction({
        payerPublicKey: wallet.publicKey,
        amount,
        memo
      });
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await retry(
        () => this.connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: txOptions?.skipPreflight ?? false,
          preflightCommitment: txOptions?.commitment ?? "confirmed",
          maxRetries: txOptions?.maxRetries ?? 3
        }),
        3
      );
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
      });
      return {
        success: true,
        signature,
        amount,
        merchantAddress: this.merchantWallet.toBase58()
      };
    } catch (error) {
      return {
        success: false,
        signature: "",
        amount,
        merchantAddress: this.merchantWallet.toBase58(),
        error: error instanceof Error ? error.message : "Payment failed"
      };
    }
  }
  /**
   * Check payment status by transaction signature
   */
  async getPaymentStatus(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      if (!status.value) {
        return "pending";
      }
      if (status.value.err) {
        return "failed";
      }
      if (status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized") {
        return "completed";
      }
      return "pending";
    } catch {
      return "failed";
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
  async createCheckoutSession(options) {
    const { amount, description, metadata, successUrl, cancelUrl, webhookUrl } = options;
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    const baseUrl = this.config.testMode ? "http://localhost:3000" : "https://settlr.dev";
    const response = await fetch(`${baseUrl}/api/checkout/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.config.apiKey && { "Authorization": `Bearer ${this.config.apiKey}` }
      },
      body: JSON.stringify({
        merchantId: this.config.merchant.name.toLowerCase().replace(/\s+/g, "-"),
        merchantName: this.config.merchant.name,
        merchantWallet: this.config.merchant.walletAddress,
        amount,
        description,
        metadata,
        successUrl,
        cancelUrl,
        webhookUrl
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create checkout session");
    }
    return response.json();
  }
  /**
   * Get merchant's USDC balance
   */
  async getMerchantBalance() {
    try {
      const ata = await (0, import_spl_token.getAssociatedTokenAddress)(this.usdcMint, this.merchantWallet);
      const account = await (0, import_spl_token.getAccount)(this.connection, ata);
      return Number(account.amount) / 1e6;
    } catch {
      return 0;
    }
  }
  /**
   * Generate QR code for payment URL
   */
  async generateQRCode(url) {
    const encoded = encodeURIComponent(url);
    return `data:image/svg+xml,${encoded}`;
  }
  /**
   * Get the connection instance
   */
  getConnection() {
    return this.connection;
  }
  /**
   * Get merchant wallet address
   */
  getMerchantAddress() {
    return this.merchantWallet;
  }
  /**
   * Get USDC mint address
   */
  getUsdcMint() {
    return this.usdcMint;
  }
};

// src/react.tsx
var import_react = require("react");
var import_wallet_adapter_react = require("@solana/wallet-adapter-react");
var import_jsx_runtime = require("react/jsx-runtime");
var SettlrContext = (0, import_react.createContext)(null);
function SettlrProvider({ children, config }) {
  const { connection } = (0, import_wallet_adapter_react.useConnection)();
  const wallet = (0, import_wallet_adapter_react.useWallet)();
  const settlr = (0, import_react.useMemo)(() => {
    return new Settlr({
      ...config,
      rpcEndpoint: connection.rpcEndpoint
    });
  }, [config, connection.rpcEndpoint]);
  const value = (0, import_react.useMemo)(
    () => ({
      settlr,
      connected: wallet.connected,
      createPayment: (options) => {
        return settlr.createPayment(options);
      },
      pay: async (options) => {
        if (!wallet.publicKey || !wallet.signTransaction) {
          return {
            success: false,
            signature: "",
            amount: options.amount,
            merchantAddress: settlr.getMerchantAddress().toBase58(),
            error: "Wallet not connected"
          };
        }
        return settlr.pay({
          wallet: {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction
          },
          amount: options.amount,
          memo: options.memo
        });
      },
      getBalance: () => {
        return settlr.getMerchantBalance();
      }
    }),
    [settlr, wallet]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettlrContext.Provider, { value, children });
}
function useSettlr() {
  const context = (0, import_react.useContext)(SettlrContext);
  if (!context) {
    throw new Error("useSettlr must be used within a SettlrProvider");
  }
  return context;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SETTLR_CHECKOUT_URL,
  SUPPORTED_NETWORKS,
  Settlr,
  SettlrProvider,
  USDC_MINT_DEVNET,
  USDC_MINT_MAINNET,
  formatUSDC,
  parseUSDC,
  shortenAddress,
  useSettlr
});
