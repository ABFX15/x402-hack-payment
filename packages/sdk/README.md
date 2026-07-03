# @offbank/sdk

Server-side SDK for [Offbank](https://offbankpay.com) — self-custodial USDC payments for merchants processors won't touch (high-risk e-commerce & iGaming). Create invoices, spin up checkout sessions, send payouts, and verify webhooks.

> **Server-side only.** Your API key can move money — never ship it to a browser. For in-page checkout, use the `<script src="https://offbankpay.com/embed.js">` widget instead.

## Install

```bash
npm install @offbank/sdk
```

Requires Node 18+ (uses the built-in `fetch`).

## Quick start

```ts
import { Offbank } from "@offbank/sdk";

const offbank = new Offbank({ apiKey: process.env.OFFBANK_API_KEY! });
```

Get an API key from your dashboard → **Settings → API keys**.

## Invoices

```ts
const invoice = await offbank.invoices.create({
  buyerName: "DynaVap Wholesale",
  buyerEmail: "ap@dynavap.com",
  lineItems: [
    { description: "VonG (case of 24)", quantity: 10, unitPrice: 1200 },
  ],
  dueDate: "2026-08-01",
  memo: "Net 30",
});

console.log(invoice.invoiceUrl); // hosted USDC pay page

await offbank.invoices.list({ status: "sent", limit: 20 });
await offbank.invoices.get(invoice.id);
```

## Checkout sessions

Server-fixed amount (untamperable), for a hosted or embedded checkout:

```ts
const session = await offbank.checkout.sessions.create({
  merchantWallet: "DjLF…rSQV",
  merchantName: "DynaVap Store",
  amount: 74.0,
  successUrl: "https://store.com/thanks",
  cancelUrl: "https://store.com/cart",
  webhookUrl: "https://store.com/api/offbank-webhook",
});

// Redirect the buyer to session.url, or pass session.id to the embed widget.
```

## Payouts

Pay anyone in USDC by email — they claim via a link (great for iGaming
withdrawals and affiliate payouts):

```ts
await offbank.payouts.create({
  email: "winner@example.com",
  amount: 250.0,
  memo: "Tournament prize",
});
```

## Verifying webhooks

Offbank signs each webhook with your per-merchant secret. Verify the **raw**
request body before trusting it:

```ts
import { Offbank } from "@offbank/sdk";

// Express example — make sure you have the raw body (e.g. express.raw()).
app.post("/api/offbank-webhook", (req, res) => {
  const ok = offbank.webhooks.verify(
    req.body.toString("utf8"),                // raw body string
    req.header("X-Offbank-Signature"),        // signature header
    process.env.OFFBANK_WEBHOOK_SECRET!,      // from the dashboard
    300,                                      // optional: max age in seconds
  );
  if (!ok) return res.status(400).send("bad signature");

  const event = JSON.parse(req.body.toString("utf8"));
  if (event.event === "payment.completed") {
    // fulfil the order — payment is verified on-chain by Offbank
  }
  res.sendStatus(200);
});
```

`verify()` returns `true` only when the HMAC-SHA256 signature matches (constant-time)
and, if you pass `toleranceSeconds`, the timestamp is fresh.

## Errors

Failed requests throw `OffbankError` with `.status` and `.code`:

```ts
import { OffbankError } from "@offbank/sdk";

try {
  await offbank.invoices.create(/* … */);
} catch (e) {
  if (e instanceof OffbankError) console.error(e.status, e.code, e.message);
}
```

## License

MIT
