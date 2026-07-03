"use client";

/**
 * Embeddable store checkout — rendered inside an iframe on a merchant's online
 * store (via /embed.js), driven by the live cart total at checkout time.
 *
 * Two config modes:
 *   • Param mode  — store passes merchant + amount (+ items, order) in the URL.
 *                   Amount integrity is enforced by the store verifying the
 *                   webhook server-side before fulfilling.
 *   • Session mode — store creates a checkout session server-side (amount fixed
 *                   on the server, untamperable) and passes ?session=ID.
 *
 * Two ways to pay USDC straight to the merchant's wallet:
 *   1. Pay with wallet — connect an injected wallet (Phantom/Solflare) in-page.
 *   2. Scan the Solana Pay QR — pay from any wallet on another device.
 *
 * Either way we confirm on-chain, close out the session (fires the merchant
 * webhook → store marks the order paid), and postMessage the result to the
 * parent page.
 */

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";
import {
  EVM_CHAINS,
  isEvmAddress,
  getEvmWallets,
  payUsdcEvm,
  waitForEvmReceipt,
  isWalletConnectConfigured,
  getWalletConnectProvider,
  type EvmWallet,
  type EvmChainKey,
} from "@/lib/evm";

export const dynamic = "force-dynamic";

type Status = "loading" | "awaiting" | "paying" | "paid" | "error";
interface LineItem {
  name: string;
  qty?: number;
  price?: number;
}
interface Config {
  merchant: string;
  name: string;
  amount: number;
  order: string;
  webhook: string;
  items: LineItem[];
  sessionId: string | null;
  sandbox: boolean;
  /** Optional EVM (Ethereum/Base) receiving address — enables paying from an
   * Ethereum wallet (MetaMask etc.). */
  evm: string;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function postToParent(msg: Record<string, unknown>) {
  try {
    window.parent?.postMessage(msg, "*");
  } catch {
    /* not framed — ignore */
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSolanaProvider(): any | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (
    w.phantom?.solana ||
    (w.solana?.isPhantom && w.solana) ||
    w.solflare ||
    w.solana ||
    null
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SolWallet {
  name: string;
  icon: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
}

/** Discover the Solana wallets injected in this browser so the buyer can pick
 * the one they actually use (Phantom, Solflare, Backpack, …) instead of us
 * silently grabbing whichever one won the `window.solana` race. */
function getSolanaWallets(): SolWallet[] {
  if (typeof window === "undefined") return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const found: SolWallet[] = [];
  const push = (name: string, provider: unknown, icon = "") => {
    if (provider && !found.some((f) => f.name === name)) {
      found.push({ name, provider, icon });
    }
  };

  // Phantom exposes itself at window.phantom.solana (and window.solana.isPhantom).
  push("Phantom", w.phantom?.solana || (w.solana?.isPhantom ? w.solana : null));
  // Solflare — window.solflare (and sometimes window.solana.isSolflare).
  push(
    "Solflare",
    w.solflare || (w.solana?.isSolflare ? w.solana : null),
  );
  // Backpack — window.backpack (xNFT provider) or window.solana.isBackpack.
  push(
    "Backpack",
    w.backpack?.solana || w.backpack || (w.solana?.isBackpack ? w.solana : null),
  );

  // Fallback: an unbranded injected provider (some wallets only set window.solana).
  if (found.length === 0 && w.solana) push("Wallet", w.solana);
  return found;
}

function EmbedCheckout() {
  const params = useSearchParams();

  const [cfg, setCfg] = useState<Config | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [solanaUrl, setSolanaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [solWallets, setSolWallets] = useState<SolWallet[]>([]);
  const [evmWallets, setEvmWallets] = useState<EvmWallet[]>([]);
  const [evmChain, setEvmChain] = useState<EvmChainKey>("base");
  const referenceRef = useRef<PublicKey | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  // ── Resolve config (param mode OR session mode), then set up payment ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionParam = params.get("session");
      const sandbox =
        params.get("sandbox") === "1" || params.get("sandbox") === "true";
      let resolved: Config | null = null;

      if (sessionParam) {
        // Session mode — fetch the server-fixed amount/merchant.
        try {
          const res = await fetch(
            `/api/checkout/sessions?id=${encodeURIComponent(sessionParam)}`,
          );
          if (res.ok) {
            const s = await res.json();
            resolved = {
              merchant: s.merchantWallet,
              name: s.merchantName || "Store",
              amount: Number(s.amount),
              order: s.description || "",
              webhook: "",
              items: Array.isArray(s.metadata?.items) ? s.metadata.items : [],
              sessionId: s.id || sessionParam,
              sandbox,
              evm: s.metadata?.evm || "",
            };
          }
        } catch {
          /* fall through to error */
        }
      } else {
        // Param mode.
        let items: LineItem[] = [];
        try {
          const raw = params.get("items");
          if (raw) items = JSON.parse(raw);
        } catch {
          /* ignore malformed items */
        }
        resolved = {
          merchant: params.get("merchant") || "",
          name: params.get("name") || "Merchant",
          amount: parseFloat(params.get("amount") || ""),
          order: params.get("order") || "",
          webhook: params.get("webhook") || "",
          items,
          sessionId: null,
          sandbox,
          evm: params.get("evm") || "",
        };
      }

      // Validate.
      let valid = !!resolved && resolved.amount > 0;
      try {
        if (resolved) new PublicKey(resolved.merchant);
      } catch {
        valid = false;
      }
      if (cancelled) return;
      if (!valid || !resolved) {
        setError("This checkout link is misconfigured.");
        setStatus("error");
        return;
      }

      setCfg(resolved);
      setHasWallet(!!getSolanaProvider());
      setSolWallets(getSolanaWallets());
      // Some wallet extensions inject a tick after load — re-scan shortly.
      setTimeout(() => {
        if (!cancelled) setSolWallets(getSolanaWallets());
      }, 300);
      if (isEvmAddress(resolved.evm)) {
        setEvmWallets(getEvmWallets());
        // EIP-6963 announcements can arrive a tick late; re-scan shortly.
        setTimeout(() => {
          if (!cancelled) setEvmWallets(getEvmWallets());
        }, 300);
      }
      sessionIdRef.current = resolved.sessionId;

      const reference = Keypair.generate().publicKey;
      referenceRef.current = reference;
      const spParams = new URLSearchParams({
        amount: resolved.amount.toString(),
        "spl-token": USDC_MINT_ADDRESS,
        reference: reference.toBase58(),
        label: resolved.name,
        message: `Payment to ${resolved.name}${resolved.order ? ` · ${resolved.order}` : ""}`,
      });
      setSolanaUrl(`solana:${resolved.merchant}?${spParams.toString()}`);
      setStatus("awaiting");

      // Param mode: create a session so the payment records + webhook fires.
      // Skipped in sandbox (no real payment / on-chain verification happens).
      if (!resolved.sessionId && !resolved.sandbox) {
        try {
          const referrer =
            document.referrer ||
            window.location.origin ||
            "https://offbankpay.com";
          const res = await fetch("/api/checkout/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              merchantId: resolved.merchant,
              merchantName: resolved.name,
              merchantWallet: resolved.merchant,
              amount: resolved.amount,
              description: resolved.order || undefined,
              metadata: {
                reference: reference.toBase58(),
                ...(resolved.order ? { orderId: resolved.order } : {}),
                ...(resolved.items.length ? { items: resolved.items } : {}),
              },
              successUrl: referrer,
              cancelUrl: referrer,
              webhookUrl: resolved.webhook || undefined,
            }),
          });
          if (res.ok && !cancelled) sessionIdRef.current = (await res.json()).id;
        } catch {
          /* session is optional — confirmation still works */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const closeOut = useCallback(
    (signature: string, customerWallet: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      // Sandbox payments aren't real, so skip the on-chain-verified /complete.
      if (sessionIdRef.current && !cfg?.sandbox) {
        fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            signature,
            customerWallet,
          }),
        }).catch(() => {});
      }
      setStatus("paid");
      postToParent({
        type: "offbank:checkout:success",
        sessionId: sessionIdRef.current,
        signature,
        amount: cfg?.amount,
        order: cfg?.order,
      });
    },
    [cfg],
  );

  // ── Sandbox: complete the flow without a real payment (for demos) ──
  const simulatePayment = useCallback(() => {
    closeOut(
      "SANDBOX_" + Date.now().toString(36),
      "SandboxBuyer1111111111111111111111111111111",
    );
  }, [closeOut]);

  // ── Path 1: pay with an injected browser wallet ──
  const payWithWallet = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (provider: any) => {
    if (!cfg) return;
    setError(null);
    provider = provider || getSolanaProvider();
    if (!provider) {
      setError("No browser wallet found — scan the QR with your phone instead.");
      return;
    }
    setStatus("paying");
    try {
      const resp = await provider.connect();
      const buyer = new PublicKey(
        (resp?.publicKey || provider.publicKey).toString(),
      );
      const merchantPk = new PublicKey(cfg.merchant);
      const mint = new PublicKey(USDC_MINT_ADDRESS);
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");

      const buyerAta = await getAssociatedTokenAddress(mint, buyer);
      const merchantAta = await getAssociatedTokenAddress(mint, merchantPk);

      const tx = new Transaction();
      try {
        await getAccount(connection, merchantAta);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            buyer,
            merchantAta,
            merchantPk,
            mint,
          ),
        );
      }
      tx.add(
        createTransferInstruction(
          buyerAta,
          merchantAta,
          buyer,
          BigInt(Math.round(cfg.amount * 1_000_000)),
        ),
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = buyer;

      const out = await provider.signAndSendTransaction(tx);
      const signature: string = typeof out === "string" ? out : out.signature;

      const conf = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      if (conf.value.err) {
        throw new Error("Payment didn't settle — check your USDC balance.");
      }
      closeOut(signature, buyer.toBase58());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed.";
      setError(/reject|declin|cancel/i.test(msg) ? "Payment cancelled." : msg);
      setStatus("awaiting");
    }
  }, [cfg, closeOut]);

  // ── Path 1b: pay USDC from a chosen Ethereum / Base wallet ──
  const payEvm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (provider: any) => {
    if (!cfg || !isEvmAddress(cfg.evm)) return;
    setError(null);
    setStatus("paying");
    try {
      const { txHash, from } = await payUsdcEvm({
        chain: evmChain,
        merchant: cfg.evm,
        amountUsd: cfg.amount,
        provider,
      });
      const ok = await waitForEvmReceipt(txHash, provider);
      if (!ok) {
        throw new Error(
          "Payment didn't confirm — check your USDC balance on " +
            EVM_CHAINS[evmChain].name +
            ".",
        );
      }
      // EVM settles to the merchant's EVM wallet directly; notify the parent.
      closeOut(txHash, from);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (e as any)?.code;
      const msg = e instanceof Error ? e.message : "Payment failed.";
      setError(
        code === 4001 || /reject|declin|cancel/i.test(msg)
          ? "Payment cancelled."
          : msg,
      );
      setStatus("awaiting");
    }
  }, [cfg, evmChain, closeOut]);

  // ── Path 1c: WalletConnect (mobile + the long tail, via QR/deep link) ──
  const payWithWalletConnect = useCallback(async () => {
    if (!cfg || !isEvmAddress(cfg.evm)) return;
    setError(null);
    try {
      const provider = await getWalletConnectProvider(evmChain);
      await payEvm(provider);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "WalletConnect failed.";
      setError(/reject|declin|cancel|close/i.test(msg) ? "Cancelled." : msg);
      setStatus("awaiting");
    }
  }, [cfg, evmChain, payEvm]);

  // ── Path 2: watch the chain for a QR payment carrying this reference ──
  useEffect(() => {
    if (status !== "awaiting" || !referenceRef.current) return;
    const reference = referenceRef.current;
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    let cancelled = false;

    const id = setInterval(async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(reference, {
          limit: 1,
        });
        if (cancelled || sigs.length === 0) return;
        const sig = sigs[0];
        if (sig.err) return;
        if (
          sig.confirmationStatus !== "confirmed" &&
          sig.confirmationStatus !== "finalized"
        )
          return;

        cancelled = true;
        clearInterval(id);
        const signature = sig.signature;

        let customerWallet = "unknown";
        try {
          const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          });
          const payer = tx?.transaction.message.accountKeys.find(
            (k) => k.signer,
          )?.pubkey;
          if (payer) customerWallet = payer.toBase58();
        } catch {
          /* ignore */
        }
        closeOut(signature, customerWallet);
      } catch {
        /* transient RPC error — keep polling */
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, closeOut]);

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(solanaUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }, [solanaUrl]);

  const cancel = () => postToParent({ type: "offbank:checkout:close" });
  const embedded =
    typeof window !== "undefined" && window.self !== window.top;

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-7 text-[#101828]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
          Offbank
          {cfg?.sandbox && (
            <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#92400e]">
              Sandbox
            </span>
          )}
        </span>
        {embedded && (
          <button
            onClick={cancel}
            aria-label="Close"
            className="rounded-full p-1.5 text-[#98a2b3] transition-colors hover:bg-[#f2f4f7] hover:text-[#475467]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {status === "error" && (
          <p className="max-w-xs text-sm text-[#d92d20]">{error}</p>
        )}

        {status === "loading" && (
          <p className="text-sm text-[#667085]">Preparing checkout…</p>
        )}

        {cfg && (status === "awaiting" || status === "paying") && (
          <>
            <p className="text-[13px] font-medium uppercase tracking-wide text-[#98a2b3]">
              Pay {cfg.name}
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {fmtUSD(cfg.amount)}
            </p>
            <p className="mb-4 mt-0.5 text-[13px] text-[#667085]">in USDC</p>

            {/* Order summary (line items) */}
            {cfg.items.length > 0 && (
              <div className="mb-5 w-full max-w-[18rem] rounded-xl border border-[#eaecf0] bg-[#fcfcfd] p-3 text-left">
                {cfg.items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-0.5 text-[13px]"
                  >
                    <span className="truncate text-[#475467]">
                      {it.qty && it.qty > 1 ? `${it.qty}× ` : ""}
                      {it.name}
                    </span>
                    {typeof it.price === "number" && (
                      <span className="ml-2 flex-shrink-0 text-[#101828]">
                        {fmtUSD(it.price * (it.qty || 1))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {cfg?.sandbox && (
              <button
                onClick={simulatePayment}
                className="mb-3 flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048]"
              >
                ✓ Simulate successful payment
              </button>
            )}

            {cfg?.sandbox && (
              <div className="mb-1 w-full max-w-[18rem] text-center text-[12px] text-[#98a2b3]">
                Or pay for real (devnet):
              </div>
            )}

            {/* Solana wallets — one button each, so the buyer picks the wallet
                they actually use (Phantom / Solflare / Backpack). */}
            {solWallets.length > 0 ? (
              <div className="flex w-full max-w-[18rem] flex-col gap-1.5">
                {solWallets.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => payWithWallet(w.provider)}
                    disabled={status === "paying"}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      cfg?.sandbox
                        ? "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f9fafb]"
                        : "bg-[#34c759] text-white hover:bg-[#2ba048]"
                    }`}
                  >
                    {status === "paying" ? (
                      <>
                        <span
                          className={`h-4 w-4 animate-spin rounded-full border-2 ${cfg?.sandbox ? "border-[#d0d5dd] border-t-[#344054]" : "border-white/40 border-t-white"}`}
                        />
                        Confirm in {w.name}…
                      </>
                    ) : (
                      `Pay with ${w.name}`
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => payWithWallet(null)}
                disabled={status === "paying"}
                className={`flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  cfg?.sandbox
                    ? "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f9fafb]"
                    : "bg-[#34c759] text-white hover:bg-[#2ba048]"
                }`}
              >
                {status === "paying" ? (
                  <>
                    <span
                      className={`h-4 w-4 animate-spin rounded-full border-2 ${cfg?.sandbox ? "border-[#d0d5dd] border-t-[#344054]" : "border-white/40 border-t-white"}`}
                    />
                    Confirm in your wallet…
                  </>
                ) : (
                  "Pay with wallet"
                )}
              </button>
            )}
            {!hasWallet && status === "awaiting" && (
              <p className="mt-2 max-w-[16rem] text-[12px] text-[#98a2b3]">
                No browser wallet detected — scan below with your phone.
              </p>
            )}
            {error && status === "awaiting" && (
              <p className="mt-2 max-w-[16rem] text-[12px] text-[#d92d20]">
                {error}
              </p>
            )}

            {/* EVM path — pay USDC from an Ethereum / Base wallet */}
            {cfg && isEvmAddress(cfg.evm) && (
              <div className="mt-4 w-full max-w-[18rem]">
                <div className="mb-2 flex items-center gap-3 text-[12px] text-[#98a2b3]">
                  <span className="h-px flex-1 bg-[#eaecf0]" />
                  or pay with Ethereum
                  <span className="h-px flex-1 bg-[#eaecf0]" />
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {(Object.keys(EVM_CHAINS) as EvmChainKey[]).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setEvmChain(ch)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                        evmChain === ch
                          ? "border-[#34c759] bg-[#34c759]/5 text-[#027a48]"
                          : "border-[#eaecf0] text-[#667085] hover:bg-[#f9fafb]"
                      }`}
                    >
                      {EVM_CHAINS[ch].name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  {evmWallets.map((w) => (
                    <button
                      key={w.uuid}
                      onClick={() => payEvm(w.provider)}
                      disabled={status === "paying"}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f9fafb] disabled:opacity-60"
                    >
                      {w.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.icon} alt="" className="h-4 w-4 rounded" />
                      )}
                      Pay with {w.name}
                    </button>
                  ))}
                </div>
                {isWalletConnectConfigured() && (
                  <button
                    onClick={payWithWalletConnect}
                    disabled={status === "paying"}
                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f9fafb] disabled:opacity-60"
                  >
                    Pay with another wallet (mobile)
                  </button>
                )}
                {evmWallets.length === 0 && !isWalletConnectConfigured() && (
                  <p className="mt-1.5 text-[12px] text-[#98a2b3]">
                    Install MetaMask (or another Ethereum wallet) to pay on
                    Ethereum or Base.
                  </p>
                )}
              </div>
            )}

            <div className="my-5 flex w-full max-w-[18rem] items-center gap-3 text-[12px] text-[#98a2b3]">
              <span className="h-px flex-1 bg-[#eaecf0]" />
              or scan to pay
              <span className="h-px flex-1 bg-[#eaecf0]" />
            </div>

            <div className="rounded-2xl border border-[#eaecf0] p-3 shadow-sm">
              <QRCodeSVG value={solanaUrl} size={168} level="M" />
            </div>
            <button
              onClick={copyLink}
              className="mt-3 text-[12px] font-medium text-[#475467] underline-offset-2 hover:underline"
            >
              {copied ? "Link copied" : "Copy payment link"}
            </button>

            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#98a2b3]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
              </span>
              Waiting for payment…
            </div>
          </>
        )}

        {cfg && status === "paid" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#34c759]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-5 text-xl font-bold">Payment received</p>
            <p className="mt-1 text-sm text-[#667085]">
              {fmtUSD(cfg.amount)} paid to {cfg.name}
            </p>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-[#98a2b3]">
        Secured by Offbank · offbankpay.com
      </p>
    </div>
  );
}

export default function EmbedCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#667085]">
          Loading…
        </div>
      }
    >
      <EmbedCheckout />
    </Suspense>
  );
}
