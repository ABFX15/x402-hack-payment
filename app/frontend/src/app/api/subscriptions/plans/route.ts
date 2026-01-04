import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// In-memory storage for subscription plans (fallback)
const memoryPlans = new Map<string, SubscriptionPlan>();

interface SubscriptionPlan {
    id: string;
    merchantId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: "daily" | "weekly" | "monthly" | "yearly";
    intervalCount: number;
    trialDays: number;
    features: string[];
    active: boolean;
    subscriberCount: number;
    createdAt: string;
    updatedAt: string;
}

function generatePlanId(): string {
    return `plan_${crypto.randomBytes(12).toString("hex")}`;
}

/**
 * GET /api/subscriptions/plans - List subscription plans for a merchant
 */
export async function GET(request: NextRequest) {
    try {
        const merchantId = request.nextUrl.searchParams.get("merchantId");

        if (!merchantId) {
            return NextResponse.json(
                { error: "merchantId is required" },
                { status: 400 }
            );
        }

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from("subscription_plans")
                .select("*")
                .eq("merchant_id", merchantId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json({ plans: [] });
            }

            const plans = data.map((p) => ({
                id: p.id,
                merchantId: p.merchant_id,
                name: p.name,
                description: p.description,
                amount: p.amount,
                currency: p.currency,
                interval: p.interval,
                intervalCount: p.interval_count,
                trialDays: p.trial_days,
                features: p.features || [],
                active: p.active,
                subscriberCount: p.subscriber_count || 0,
                createdAt: p.created_at,
                updatedAt: p.updated_at,
            }));

            return NextResponse.json({ plans });
        } else {
            // Memory fallback
            const plans = Array.from(memoryPlans.values()).filter(
                (p) => p.merchantId === merchantId
            );
            return NextResponse.json({ plans });
        }
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription plans" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/subscriptions/plans - Create a new subscription plan
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            merchantId,
            name,
            description,
            amount,
            interval = "monthly",
            intervalCount = 1,
            trialDays = 0,
            features = [],
        } = body;

        if (!merchantId || !name || !amount) {
            return NextResponse.json(
                { error: "merchantId, name, and amount are required" },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();
        const plan: SubscriptionPlan = {
            id: generatePlanId(),
            merchantId,
            name,
            description,
            amount: parseFloat(amount),
            currency: "USDC",
            interval,
            intervalCount,
            trialDays,
            features,
            active: true,
            subscriberCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from("subscription_plans")
                .insert({
                    id: plan.id,
                    merchant_id: merchantId,
                    name,
                    description,
                    amount: plan.amount,
                    currency: "USDC",
                    interval,
                    interval_count: intervalCount,
                    trial_days: trialDays,
                    features,
                    active: true,
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json(
                    { error: "Failed to create subscription plan" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                plan: {
                    id: data.id,
                    merchantId: data.merchant_id,
                    name: data.name,
                    description: data.description,
                    amount: data.amount,
                    currency: data.currency,
                    interval: data.interval,
                    intervalCount: data.interval_count,
                    trialDays: data.trial_days,
                    features: data.features || [],
                    active: data.active,
                    subscriberCount: 0,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                },
            });
        } else {
            memoryPlans.set(plan.id, plan);
            return NextResponse.json({ plan });
        }
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json(
            { error: "Failed to create subscription plan" },
            { status: 500 }
        );
    }
}
