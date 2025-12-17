import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, checkRateLimit } from "@/lib/db";

/**
 * POST /api/sdk/validate
 * Validates an API key and checks rate limits
 */
export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (!apiKey) {
            return NextResponse.json(
                { valid: false, error: "API key required" },
                { status: 401 }
            );
        }

        // Check rate limit first
        const rateLimit = await checkRateLimit(apiKey);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    valid: false,
                    error: "Rate limit exceeded",
                    retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
                        "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
                    },
                }
            );
        }

        // Validate the API key
        const validation = await validateApiKey(apiKey);

        if (!validation.valid) {
            return NextResponse.json(
                { valid: false, error: validation.error || "Invalid API key" },
                { status: 401 }
            );
        }

        // Return validation result with rate limit headers
        return NextResponse.json(
            {
                valid: true,
                merchantId: validation.merchantId,
                tier: validation.tier,
                rateLimit: validation.rateLimit,
            },
            {
                headers: {
                    "X-RateLimit-Limit": (validation.rateLimit || 60).toString(),
                    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                    "X-RateLimit-Reset": rateLimit.resetAt.toString(),
                },
            }
        );
    } catch (error) {
        console.error("API key validation error:", error);
        return NextResponse.json(
            { valid: false, error: "Validation failed" },
            { status: 500 }
        );
    }
}
