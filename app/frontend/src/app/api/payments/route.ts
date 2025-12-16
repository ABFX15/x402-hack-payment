import { NextResponse } from "next/server";
import { getAllPayments } from "@/lib/db";

/**
 * GET /api/payments
 * 
 * Fetch all payments (in production, filter by merchant's API key)
 */
export async function GET() {
    try {
        const payments = await getAllPayments();

        return NextResponse.json({
            payments,
            count: payments.length,
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments", payments: [] },
            { status: 500 }
        );
    }
}
