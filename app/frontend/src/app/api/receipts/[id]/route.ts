import { NextRequest } from "next/server";

// Mock DB lookup for demo
const mockPayments = [
    {
        id: "pay_001",
        merchant: {
            name: "Acme SaaS",
            wallet: "7xKX...3mPq",
        },
        customer: {
            wallet: "4dGo...7Ywd",
        },
        amount: 29.99,
        currency: "USDC",
        timestamp: "2025-12-16T10:30:00Z",
        txSignature: "5Tz7...",
        status: "completed",
    },
];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const payment = mockPayments.find((p) => p.id === id);
    if (!payment) {
        return new Response(JSON.stringify({ error: "Receipt not found" }), { status: 404 });
    }
    const explorerUrl = `https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`;
    return new Response(
        JSON.stringify({
            receiptId: `RCP-2025-${id}`,
            ...payment,
            explorerUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}
