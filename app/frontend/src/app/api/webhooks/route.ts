import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// In-memory storage for webhooks (fallback)
const memoryWebhooks = new Map<string, WebhookConfig>();

interface WebhookConfig {
    id: string;
    merchantId: string;
    url: string;
    secret: string;
    events: string[];
    active: boolean;
    lastDeliveryAt?: string;
    lastDeliveryStatus?: "success" | "failed";
    createdAt: string;
}

function generateWebhookId(): string {
    return `wh_${crypto.randomBytes(16).toString("hex")}`;
}

function generateWebhookSecret(): string {
    return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

/**
 * GET /api/webhooks - List webhooks for a merchant
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
                .from("webhooks")
                .select("*")
                .eq("merchant_id", merchantId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json({ webhooks: [] });
            }

            const webhooks = data.map((w) => ({
                id: w.id,
                merchantId: w.merchant_id,
                url: w.url,
                secret: w.secret,
                events: w.events,
                active: w.active,
                lastDeliveryAt: w.last_delivery_at,
                lastDeliveryStatus: w.last_delivery_status,
                createdAt: w.created_at,
            }));

            return NextResponse.json({ webhooks });
        } else {
            // Memory fallback
            const webhooks = Array.from(memoryWebhooks.values()).filter(
                (w) => w.merchantId === merchantId
            );
            return NextResponse.json({ webhooks });
        }
    } catch (error) {
        console.error("Error fetching webhooks:", error);
        return NextResponse.json(
            { error: "Failed to fetch webhooks" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/webhooks - Create a new webhook
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { merchantId, url, events } = body;

        if (!merchantId || !url || !events || events.length === 0) {
            return NextResponse.json(
                { error: "merchantId, url, and events are required" },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== "https:" && !url.includes("localhost")) {
                return NextResponse.json(
                    { error: "Webhook URL must use HTTPS" },
                    { status: 400 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: "Invalid webhook URL" },
                { status: 400 }
            );
        }

        const webhook: WebhookConfig = {
            id: generateWebhookId(),
            merchantId,
            url,
            secret: generateWebhookSecret(),
            events,
            active: true,
            createdAt: new Date().toISOString(),
        };

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from("webhooks")
                .insert({
                    id: webhook.id,
                    merchant_id: merchantId,
                    url,
                    secret: webhook.secret,
                    events,
                    active: true,
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json(
                    { error: "Failed to create webhook" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                webhook: {
                    id: data.id,
                    merchantId: data.merchant_id,
                    url: data.url,
                    secret: data.secret,
                    events: data.events,
                    active: data.active,
                    createdAt: data.created_at,
                },
            });
        } else {
            memoryWebhooks.set(webhook.id, webhook);
            return NextResponse.json({ webhook });
        }
    } catch (error) {
        console.error("Error creating webhook:", error);
        return NextResponse.json(
            { error: "Failed to create webhook" },
            { status: 500 }
        );
    }
}
