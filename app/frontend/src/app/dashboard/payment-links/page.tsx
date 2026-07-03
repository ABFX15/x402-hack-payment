"use client";

/**
 * Payment Links - the no-code front end for the checkout widget. A merchant
 * sets an amount, gets a shareable hosted checkout link + a copy-paste embed
 * snippet, and a QR. Links are stateless (encoded in the URL) so they never
 * expire; recent ones are remembered locally for convenience.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import { QRCodeSVG } from "qrcode.react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Code2,
  QrCode,
} from "lucide-react";

interface SavedLink {
  amount: number;
  name: string;
  order?: string;
  url: string;
  createdAt: number;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#34c759]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

export default function PaymentLinksPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [storeName, setStoreName] = useState("");
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState("");
  const [webhook, setWebhook] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generated, setGenerated] = useState<SavedLink | null>(null);
  const [tab, setTab] = useState<"link" | "embed" | "qr">("link");
  const [recent, setRecent] = useState<SavedLink[]>([]);
  const [evmAddress, setEvmAddress] = useState("");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://offbankpay.com";
  const storageKey = publicKey ? `offbank:paymentlinks:${publicKey}` : "";

  // Prefill the store name + EVM receiving address from the merchant record.
  useEffect(() => {
    if (!publicKey) return;
    fetch(`/api/merchants/by-wallet?wallet=${publicKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.merchant?.name) setStoreName(d.merchant.name);
      })
      .catch(() => {});
    fetch(`/api/merchant/settings?wallet=${publicKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.evmAddress) setEvmAddress(d.evmAddress);
      })
      .catch(() => {});
  }, [publicKey]);

  // Load recent links from local storage.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persist = useCallback(
    (links: SavedLink[]) => {
      setRecent(links);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(links));
    },
    [storageKey],
  );

  const buildUrl = useCallback(
    (a: number, name: string, ord: string, hook: string) => {
      const p = new URLSearchParams({
        merchant: publicKey || "",
        amount: String(a),
        name: name || "Store",
      });
      if (ord) p.set("order", ord);
      if (hook) p.set("webhook", hook);
      if (evmAddress) p.set("evm", evmAddress);
      return `${origin}/embed/checkout?${p.toString()}`;
    },
    [publicKey, origin, evmAddress],
  );

  const generate = () => {
    const a = parseFloat(amount);
    if (!publicKey || !a || a <= 0) return;
    const link: SavedLink = {
      amount: a,
      name: storeName || "Store",
      order: order || undefined,
      url: buildUrl(a, storeName, order, webhook),
      createdAt: Date.now(),
    };
    setGenerated(link);
    setTab("link");
    persist([link, ...recent].slice(0, 12));
  };

  const embedSnippet = useMemo(() => {
    if (!generated) return "";
    return `<script src="${origin}/embed.js"></script>

<button
  data-offbank-checkout
  data-merchant="${publicKey}"
  data-amount="${generated.amount}"
  data-name="${generated.name}"${generated.order ? `\n  data-order="${generated.order}"` : ""}${evmAddress ? `\n  data-evm="${evmAddress}"` : ""}>
  Pay ${fmtUSD(generated.amount)} with USDC
</button>`;
  }, [generated, origin, publicKey, evmAddress]);

  if (!connected || !publicKey) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34c759]/10">
          <Link2 className="h-7 w-7 text-[#34c759]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#101828]">
          Payment Links
        </h1>
        <p className="mt-1.5 text-[15px] text-[#667085]">
          Connect your wallet to create checkout links.
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2ba048]"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#101828]">
          Payment Links
        </h1>
        <p className="mt-1 text-[15px] text-[#667085]">
          Create a checkout link or embed snippet - get paid in USDC anywhere.
        </p>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Store name
            </label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Your business name"
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Amount (USDC)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="49.99"
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#344054]">
              Reference <span className="text-[#98a2b3]">(optional)</span>
            </label>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="INV-1023"
              className="w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="mt-3 text-[13px] font-medium text-[#475467] hover:underline"
        >
          {showAdvanced ? "Hide" : "Add"} webhook (notify your server)
        </button>
        {showAdvanced && (
          <input
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://yoursite.com/hooks/offbank"
            className="mt-2 w-full rounded-xl border border-[#d0d5dd] px-3.5 py-2.5 text-sm outline-none focus:border-[#34c759]"
          />
        )}

        <button
          onClick={generate}
          disabled={!amount || parseFloat(amount) <= 0}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048] disabled:opacity-50"
        >
          <Link2 className="h-4 w-4" />
          Generate link
        </button>
      </div>

      {/* Result */}
      {generated && (
        <div className="mt-5 rounded-2xl border border-[#34c759]/30 bg-white p-6">
          <p className="text-sm font-semibold text-[#101828]">
            {fmtUSD(generated.amount)} · {generated.name}
            {generated.order ? ` · ${generated.order}` : ""}
          </p>

          {/* Tabs */}
          <div className="mt-4 inline-flex rounded-lg bg-[#f2f4f7] p-1 text-sm">
            {[
              { id: "link", label: "Share link", icon: Link2 },
              { id: "embed", label: "Embed", icon: Code2 },
              { id: "qr", label: "QR", icon: QrCode },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                    tab === t.id
                      ? "bg-white text-[#101828] shadow-sm"
                      : "text-[#667085]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "link" && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={generated.url}
                  className="w-full truncate rounded-xl border border-[#d0d5dd] bg-[#f9fafb] px-3.5 py-2.5 text-sm text-[#475467]"
                />
                <CopyButton text={generated.url} />
                <a
                  href={generated.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#34c759] px-3 py-2 text-sm font-medium text-white hover:bg-[#2ba048]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </div>
              <p className="mt-2 text-[13px] text-[#667085]">
                Share this link by email, text, or QR - the buyer pays with their
                wallet or by scanning.
              </p>
            </div>
          )}

          {tab === "embed" && (
            <div className="mt-4">
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 text-[13px] leading-relaxed text-[#e6edf3]">
                <code>{embedSnippet}</code>
              </pre>
              <div className="mt-3">
                <CopyButton text={embedSnippet} label="Copy snippet" />
              </div>
            </div>
          )}

          {tab === "qr" && (
            <div className="mt-4 flex flex-col items-center">
              <div className="rounded-2xl border border-[#eaecf0] p-4">
                <QRCodeSVG value={generated.url} size={180} level="M" />
              </div>
              <p className="mt-3 text-[13px] text-[#667085]">
                Print it or show it on screen - scanning opens the checkout.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-[#101828]">
            Recent links
          </h2>
          <div className="divide-y divide-[#f2f4f7] rounded-2xl border border-[#eaecf0] bg-white">
            {recent.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#101828]">
                    {fmtUSD(l.amount)}
                    {l.order ? (
                      <span className="text-[#98a2b3]"> · {l.order}</span>
                    ) : null}
                  </p>
                  <p className="truncate text-[12px] text-[#98a2b3]">{l.url}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <CopyButton text={l.url} />
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#d0d5dd] p-2 text-[#475467] hover:bg-[#f9fafb]"
                    aria-label="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
