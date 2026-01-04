import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";

/**
 * POST /api/webhooks/[id]/test - Send a test webhook event
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the webhook config
        let webhook: { url: string; secret: string } | null = null;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from("webhooks")
                .select("url, secret")
                .eq("id", id)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { error: "Webhook not found" },
                    { status: 404 }
                );
            }

            webhook = data;
        } else {
            return NextResponse.json(
                { error: "Webhook not found" },
                { status: 404 }
            );
        }

        // Create test payload
        const testPayload = {
            id: `evt_test_${Date.now()}`,
            type: "payment.completed",
            test: true,
            payment: {
                id: "pay_test_123456",
                amount: 10.00,
                currency: "USDC",
                status: "completed",
                orderId: "test_order_123",
                memo: "Test payment",
                txSignature: "test_signature_" + crypto.randomBytes(32).toString("hex"),
                payerAddress: "TestPayerAddress123",
                merchantAddress: "TestMerchantAddress456",
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
        };

        // Generate signature
        const payloadString = JSON.stringify(testPayload);
        const signature = crypto
            .createHmac("sha256", webhook.secret)
            .update(payloadString)
            .digest("hex");

        // Send test webhook
        let deliveryStatus: "success" | "failed" = "failed";
        let errorMessage = "";

        try {
            const response = await fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Settlr-Signature": signature,
                    "X-Settlr-Event": "payment.completed",
                    "X-Settlr-Test": "true",
                },
                body: payloadString,
            });

            deliveryStatus = response.ok ? "success" : "failed";
            if (!response.ok) {
                errorMessage = `HTTP ${response.status}`;
            }
        } catch (err) {
            deliveryStatus = "failed";
            errorMessage = err instanceof Error ? err.message : "Unknown error";
        }

        // Update last delivery status
        if (isSupabaseConfigured()) {
            await supabase
                .from("webhooks")
                .update({
                    last_delivery_at: new Date().toISOString(),
                    last_delivery_status: deliveryStatus,
                })
                .eq("id", id);
        }

        return NextResponse.json({
            success: deliveryStatus === "success",
            deliveryStatus,
            error: errorMessage || undefined,
        });
    } catch (error) {
        console.error("Error testing webhook:", error);
        return NextResponse.json(
            { error: "Failed to test webhook" },
            { status: 500 }
        );
    }
}
