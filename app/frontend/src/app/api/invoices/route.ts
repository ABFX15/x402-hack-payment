/**
 * POST /api/invoices — Create a new invoice
 * GET  /api/invoices — List invoices for authenticated merchant
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import {
    createInvoice,
    getInvoicesByMerchant,
    getInvoiceStats,
    updateInvoiceStatus,
    getInvoice,
    getOrCreateMerchantByWallet,
} from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";
import { emitEvent } from "@/lib/pipeline";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { requireMerchantAuth } from "@/lib/merchant-auth";

// ─── Auth helper ───
// Accepts EITHER a merchant API key (SDK / REST) OR the dashboard session
// cookie, so invoices can be created both programmatically and from the UI.
const authenticate = requireMerchantAuth;

export async function POST(request: NextRequest) {
    try {
        const rateLimited = await checkRateLimit(`invoice:${getClientIp(request)}`);
        if (rateLimited) return rateLimited;

        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            buyerName,
            buyerEmail,
            buyerCompany,
            lineItems,
            taxRate,
            memo,
            terms,
            dueDate,
            invoiceNumber,
            sendEmail,
        } = body;

        // Validate required fields
        if (!buyerName || typeof buyerName !== "string") {
            return NextResponse.json(
                { error: "buyerName is required" },
                { status: 400 }
            );
        }
        if (
            !buyerEmail ||
            typeof buyerEmail !== "string" ||
            !buyerEmail.includes("@")
        ) {
            return NextResponse.json(
                { error: "Valid buyerEmail is required" },
                { status: 400 }
            );
        }
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json(
                { error: "At least one line item is required" },
                { status: 400 }
            );
        }
        for (let i = 0; i < lineItems.length; i++) {
            const li = lineItems[i];
            if (!li.description || typeof li.quantity !== "number" || typeof li.unitPrice !== "number") {
                return NextResponse.json(
                    { error: `Invalid line item at index ${i}` },
                    { status: 400 }
                );
            }
            // Auto-calculate amount
            li.amount = li.quantity * li.unitPrice;
        }
        if (!dueDate) {
            return NextResponse.json(
                { error: "dueDate is required" },
                { status: 400 }
            );
        }

        const invoice = await createInvoice({
            merchantId: auth.merchantId!,
            merchantName: auth.merchantName || "Merchant",
            merchantWallet: auth.merchantWallet!,
            invoiceNumber,
            buyerName,
            buyerEmail,
            buyerCompany,
            lineItems,
            taxRate: taxRate ? Number(taxRate) : undefined,
            memo,
            terms,
            dueDate: new Date(dueDate),
        });

        // Optionally send email immediately
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://offbankpay.com";
        const invoiceUrl = `${appUrl}/invoice/${invoice.viewToken}`;
        const blinkUrl = `${appUrl}/api/actions/pay?invoice=${invoice.viewToken}`;

        if (sendEmail !== false) {
            await updateInvoiceStatus(invoice.id, "sent", {
                sentAt: new Date(),
            });
            invoice.status = "sent";

            sendInvoiceEmail({
                to: buyerEmail,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                currency: invoice.currency,
                buyerName,
                merchantName: auth.merchantName || "Merchant",
                dueDate: new Date(dueDate),
                invoiceUrl,
                memo,
            }).then((sent) => {
                if (!sent) logger.error("[invoices] Email send returned false for", buyerEmail);
            }).catch((err) =>
                logger.error("[invoices] Failed to send email:", err)
            );
        }

        emitEvent("invoice.created", "invoice", invoice.id, auth.merchantId, {
            amount: invoice.total, invoiceNumber: invoice.invoiceNumber, buyerEmail: invoice.buyerEmail,
        }).catch((err) => logger.error("[pipeline] emit error:", err));

        return NextResponse.json(
            {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                total: invoice.total,
                buyerEmail: invoice.buyerEmail,
                viewToken: invoice.viewToken,
                invoiceUrl,
                blinkUrl,
                createdAt: invoice.createdAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error("[invoices] Error creating invoice:", error);
        return NextResponse.json(
            { error: "Failed to create invoice" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as
            | "draft"
            | "sent"
            | "viewed"
            | "paid"
            | "overdue"
            | "cancelled"
            | null;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const statsOnly = searchParams.get("stats") === "true";

        if (statsOnly) {
            const stats = await getInvoiceStats(auth.merchantId!);
            return NextResponse.json(stats);
        }

        const invoices = await getInvoicesByMerchant(auth.merchantId!, {
            status: status || undefined,
            limit,
            offset,
        });

        return NextResponse.json({
            invoices: invoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                buyerName: inv.buyerName,
                buyerEmail: inv.buyerEmail,
                buyerCompany: inv.buyerCompany,
                total: inv.total,
                currency: inv.currency,
                status: inv.status,
                dueDate: inv.dueDate.toISOString(),
                paidAt: inv.paidAt?.toISOString(),
                createdAt: inv.createdAt.toISOString(),
                viewToken: inv.viewToken,
            })),
            count: invoices.length,
        });
    } catch (error) {
        logger.error("[invoices] Error listing invoices:", error);
        return NextResponse.json(
            { error: "Failed to list invoices" },
            { status: 500 }
        );
    }
}
