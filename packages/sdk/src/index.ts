/**
 * @offbank/sdk — server-side client for the Offbank USDC payments API.
 *
 * Self-custodial USDC payments for merchants processors won't touch. Use this
 * from your backend to create invoices, spin up checkout sessions, send
 * payouts, and verify webhooks. Never expose your API key in a browser.
 *
 *   import { Offbank } from "@offbank/sdk";
 *   const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });
 *   const invoice = await offbank.invoices.create({ ... });
 */

import { createHmac, timingSafeEqual } from "crypto";

export interface OffbankOptions {
  /** Your merchant API key (sk_live_… / sk_test_…). Server-side only. */
  apiKey: string;
  /** API base URL. Defaults to https://offbankpay.com */
  baseUrl?: string;
  /** Custom fetch (for tests / older runtimes). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

export class OffbankError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "OffbankError";
    this.status = status;
    this.code = code;
  }
}

// ── Resource payload types ───────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceParams {
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  lineItems: InvoiceLineItem[];
  /** ISO date string or Date. */
  dueDate: string | Date;
  taxRate?: number;
  memo?: string;
  terms?: string;
  invoiceNumber?: string;
  /** Email the invoice to the buyer immediately. Default true. */
  sendEmail?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  buyerEmail: string;
  viewToken: string;
  invoiceUrl: string;
  blinkUrl?: string;
  createdAt: string;
}

export interface ListInvoicesParams {
  status?: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  limit?: number;
  offset?: number;
}

export interface CreateCheckoutSessionParams {
  /** Merchant's Solana receiving wallet. */
  merchantWallet: string;
  merchantName: string;
  /** Amount in whole USDC (e.g. 49.99). */
  amount: number;
  merchantId?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: number;
  status: string;
}

export interface CreatePayoutParams {
  /** Recipient email — they claim the USDC via a link. */
  email: string;
  /** Amount in whole USDC. */
  amount: number;
  currency?: string;
  memo?: string;
  metadata?: Record<string, unknown>;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class Offbank {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OffbankOptions) {
    if (!opts?.apiKey) throw new Error("Offbank: `apiKey` is required");
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl || "https://offbankpay.com").replace(/\/$/, "");
    const f = opts.fetchImpl || globalThis.fetch;
    if (!f) {
      throw new Error(
        "Offbank: no fetch available. Use Node 18+ or pass `fetchImpl`.",
      );
    }
    this.fetchImpl = f;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await res.text();
    let json: any = undefined;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      /* non-JSON response */
    }

    if (!res.ok) {
      const message =
        json?.message || json?.error || res.statusText || "Request failed";
      throw new OffbankError(message, res.status, json?.error);
    }
    return json as T;
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  invoices = {
    create: (params: CreateInvoiceParams): Promise<Invoice> => {
      const dueDate =
        params.dueDate instanceof Date
          ? params.dueDate.toISOString()
          : params.dueDate;
      return this.request<Invoice>("POST", "/api/invoices", {
        ...params,
        dueDate,
      });
    },
    list: (
      params: ListInvoicesParams = {},
    ): Promise<{ invoices: Invoice[]; count: number }> => {
      const q = new URLSearchParams();
      if (params.status) q.set("status", params.status);
      if (params.limit != null) q.set("limit", String(params.limit));
      if (params.offset != null) q.set("offset", String(params.offset));
      const qs = q.toString();
      return this.request("GET", `/api/invoices${qs ? `?${qs}` : ""}`);
    },
    get: (id: string): Promise<Invoice> =>
      this.request("GET", `/api/invoices/${encodeURIComponent(id)}`),
  };

  // ── Checkout sessions ─────────────────────────────────────────────────────
  checkout = {
    sessions: {
      create: (params: CreateCheckoutSessionParams): Promise<CheckoutSession> =>
        this.request<CheckoutSession>("POST", "/api/checkout/sessions", {
          merchantId: params.merchantId || params.merchantWallet,
          merchantName: params.merchantName,
          merchantWallet: params.merchantWallet,
          amount: params.amount,
          description: params.description,
          successUrl: params.successUrl,
          cancelUrl: params.cancelUrl,
          webhookUrl: params.webhookUrl,
          metadata: params.metadata,
        }),
    },
  };

  // ── Payouts ───────────────────────────────────────────────────────────────
  payouts = {
    create: (params: CreatePayoutParams): Promise<unknown> =>
      this.request("POST", "/api/payouts", params),
  };

  // ── Webhooks ──────────────────────────────────────────────────────────────
  webhooks = {
    /**
     * Verify an Offbank webhook signature. Pass the RAW request body (string),
     * the `X-Offbank-Signature` header, and your webhook signing secret (from
     * the dashboard). Returns true only if the signature is valid and — when
     * `toleranceSeconds` is set — the timestamp is fresh.
     */
    verify: (
      rawBody: string,
      signatureHeader: string | null | undefined,
      secret: string,
      toleranceSeconds?: number,
    ): boolean => verifyWebhookSignature(rawBody, signatureHeader, secret, toleranceSeconds),
  };
}

/** Standalone webhook verifier (also exported for use without a client). */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  toleranceSeconds?: number,
): boolean {
  if (!signatureHeader || !secret) return false;
  // Header format: "t=<ms>,v1=<hexhmac>"
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  if (toleranceSeconds != null) {
    const ageSec = Math.abs(Date.now() - Number(t)) / 1000;
    if (!Number.isFinite(ageSec) || ageSec > toleranceSeconds) return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
