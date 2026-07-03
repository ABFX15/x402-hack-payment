/**
 * Server-side verification of an on-chain EVM (Ethereum / Base / …) USDC payment.
 *
 * The buyer's browser confirms the transaction for UX, but that confirmation is
 * spoofable — a client can POST any tx hash. This module re-verifies the payment
 * against the chain from the server: it fetches the transaction receipt over the
 * chain's public RPC, confirms it succeeded, and looks for an ERC-20 `Transfer`
 * event on the correct USDC contract crediting at least the expected amount to
 * the merchant's address. Nothing is marked "paid" unless this passes.
 *
 * Mirrors verifyUsdcTransferToMerchant (Solana) so both chains share the same
 * "verify before trust" contract in the checkout completion path.
 */

import { EVM_CHAINS, isEvmAddress, type EvmChainKey } from "./evm";
import type { VerifyPaymentResult } from "./verify-payment";

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

interface EvmLog {
  address: string;
  topics: string[];
  data: string;
}
interface EvmReceipt {
  status: string; // "0x1" success, "0x0" fail
  blockNumber: string;
  logs: EvmLog[];
}

async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    // Never cache chain lookups.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result as T;
}

/** Left-pad an EVM address to a 32-byte topic (how `to`/`from` appear in logs). */
function addressTopic(addr: string): string {
  return "0x" + addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

export interface VerifyEvmArgs {
  /** Transaction hash from the buyer-side client. */
  txHash: string;
  /** Merchant's receiving EVM address (0x…). */
  merchant: string;
  /** Which EVM chain the payment was made on. */
  chain: EvmChainKey;
  /** Expected amount, in whole USDC (e.g. 12.34). */
  totalUsdc: number;
  /** Minimum block confirmations required. Defaults to 1 (mined). */
  minConfirmations?: number;
}

export async function verifyEvmUsdcTransfer(
  args: VerifyEvmArgs,
): Promise<VerifyPaymentResult> {
  const { txHash, merchant, chain, totalUsdc } = args;
  const minConfirmations = args.minConfirmations ?? 1;

  if (!txHash || typeof txHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return { ok: false, error: "invalid EVM transaction hash" };
  }
  if (!isEvmAddress(merchant)) {
    return { ok: false, error: "invalid merchant EVM address" };
  }
  if (!Number.isFinite(totalUsdc) || totalUsdc <= 0) {
    return { ok: false, error: "totalUsdc must be a positive number" };
  }
  const c = EVM_CHAINS[chain];
  if (!c) return { ok: false, error: "unsupported EVM chain" };

  let receipt: EvmReceipt | null;
  try {
    receipt = await rpcCall<EvmReceipt | null>(
      c.rpc,
      "eth_getTransactionReceipt",
      [txHash],
    );
  } catch {
    // RPC error / malformed — unverifiable, never treat as paid (retry later).
    return { ok: false, error: "could not look up transaction" };
  }

  if (!receipt) return { ok: false, error: "transaction not found on-chain" };
  if (receipt.status !== "0x1") {
    return { ok: false, error: "on-chain transaction failed" };
  }

  // Require the tx to be buried by at least `minConfirmations` blocks.
  try {
    const head = await rpcCall<string>(c.rpc, "eth_blockNumber", []);
    const confirmations =
      parseInt(head, 16) - parseInt(receipt.blockNumber, 16) + 1;
    if (confirmations < minConfirmations) {
      return {
        ok: false,
        error: `awaiting confirmations (${confirmations}/${minConfirmations})`,
      };
    }
  } catch {
    return { ok: false, error: "could not read chain head" };
  }

  const totalBase = BigInt(Math.round(totalUsdc * 1_000_000));
  const usdc = c.usdc.toLowerCase();
  const merchantTopic = addressTopic(merchant);

  // Find a USDC Transfer log crediting >= the expected amount to the merchant.
  for (const log of receipt.logs || []) {
    if (log.address?.toLowerCase() !== usdc) continue;
    if (!log.topics || log.topics.length < 3) continue;
    if (log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) continue;
    if (log.topics[2]?.toLowerCase() !== merchantTopic) continue;
    let value: bigint;
    try {
      value = BigInt(log.data);
    } catch {
      continue;
    }
    if (value >= totalBase) {
      return { ok: true, merchantAmountBase: value };
    }
  }

  return {
    ok: false,
    error: "no USDC transfer to the merchant address in this transaction",
  };
}

/** True if a signature/hash looks like an EVM tx hash (0x + 64 hex). */
export function isEvmTxHash(sig: string): boolean {
  return typeof sig === "string" && /^0x[0-9a-fA-F]{64}$/.test(sig);
}
