/**
 * GET /.well-known/actions.json - Solana Actions manifest
 *
 * Tells Blinks-compatible clients which URL patterns on this domain
 * are Solana Actions so they can be rendered as interactive cards.
 */

import { NextResponse } from "next/server";

const ACTIONS_CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
};

export async function GET() {
    return NextResponse.json(
        {
            rules: [
                {
                    pathPattern: "/api/actions/pay**",
                    apiPath: "/api/actions/pay**",
                },
                {
                    pathPattern: "/pay/**",
                    apiPath: "/api/actions/pay?invoice=*",
                },
            ],
        },
        { headers: ACTIONS_CORS_HEADERS }
    );
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: ACTIONS_CORS_HEADERS,
    });
}
