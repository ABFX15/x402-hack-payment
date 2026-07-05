/**
 * Self-serve affiliate registry.
 *
 * Affiliates register their own payout details via an operator's invite link,
 * so the operator never has to enter anyone by hand. Persists to Supabase when
 * configured; falls back to an in-memory store for tests/dev (mirrors the
 * payees address book).
 */

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface RegisteredAffiliate {
    id: string;
    merchantWallet: string;
    name: string;
    email: string;
    payoutWallet?: string;
    createdAt: string;
}

/* ── in-memory fallback ── */
const byMerchant: Map<string, RegisteredAffiliate[]> = new Map();

interface Row {
    id: string;
    merchant_wallet: string;
    name: string;
    email: string;
    payout_wallet?: string | null;
    created_at: string;
}

function fromRow(r: Row): RegisteredAffiliate {
    return {
        id: r.id,
        merchantWallet: r.merchant_wallet,
        name: r.name,
        email: r.email,
        payoutWallet: r.payout_wallet ?? undefined,
        createdAt: r.created_at,
    };
}

export async function listRegisteredAffiliates(
    merchantWallet: string,
): Promise<RegisteredAffiliate[]> {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from("affiliate_registrations")
                .select()
                .eq("merchant_wallet", merchantWallet)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []).map(fromRow);
        } catch (e) {
            logger.error("[affiliate-registry] list error:", e);
            return byMerchant.get(merchantWallet) || [];
        }
    }
    return byMerchant.get(merchantWallet) || [];
}

export async function registerAffiliate(input: {
    merchantWallet: string;
    name: string;
    email: string;
    payoutWallet?: string;
}): Promise<RegisteredAffiliate> {
    const rec: RegisteredAffiliate = {
        id: crypto.randomUUID(),
        merchantWallet: input.merchantWallet,
        name: input.name,
        email: input.email,
        payoutWallet: input.payoutWallet,
        createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from("affiliate_registrations")
                .upsert(
                    {
                        merchant_wallet: input.merchantWallet,
                        name: input.name,
                        email: input.email,
                        payout_wallet: input.payoutWallet ?? null,
                    },
                    { onConflict: "merchant_wallet,email" },
                )
                .select()
                .single();
            if (error) throw error;
            return fromRow(data);
        } catch (e) {
            logger.error("[affiliate-registry] register error:", e);
            /* fall through to in-memory */
        }
    }

    const list = byMerchant.get(input.merchantWallet) || [];
    const deduped = list.filter(
        (a) => a.email.toLowerCase() !== input.email.toLowerCase(),
    );
    deduped.unshift(rec);
    byMerchant.set(input.merchantWallet, deduped);
    return rec;
}
