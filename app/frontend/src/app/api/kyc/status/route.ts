import { NextRequest, NextResponse } from "next/server";
import { getApplicantByExternalId, isUserVerified } from "@/lib/sumsub";

/**
 * GET /api/kyc/status?customerId=xxx&merchantId=yyy
 * or
 * GET /api/kyc/status?userId=xxx
 * 
 * Check KYC verification status for a customer
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        const merchantId = searchParams.get("merchantId");
        const userId = searchParams.get("userId");

        // Support both formats: userId alone, or customerId:merchantId combo
        const externalUserId = userId || (customerId && merchantId ? `${customerId}:${merchantId}` : customerId);

        if (!externalUserId) {
            return NextResponse.json(
                { error: "customerId or userId is required" },
                { status: 400 }
            );
        }

        // Check if Sumsub is configured
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            // If not configured, treat everyone as verified (KYC disabled)
            return NextResponse.json({
                verified: true,
                status: "disabled",
                message: "KYC service not configured",
            });
        }

        const verified = await isUserVerified(externalUserId);
        const applicant = await getApplicantByExternalId(externalUserId);

        // Map Sumsub status to our simpler status
        let status: "verified" | "pending" | "rejected" | "unknown" = "unknown";
        if (verified) {
            status = "verified";
        } else if (applicant?.review?.reviewStatus === "pending") {
            status = "pending";
        } else if (applicant?.review?.reviewResult?.reviewAnswer === "RED") {
            status = "rejected";
        }

        return NextResponse.json({
            verified,
            status,
            applicantId: applicant?.id || null,
        });
    } catch (error) {
        console.error("Error checking KYC status:", error);
        return NextResponse.json(
            { error: "Failed to check KYC status" },
            { status: 500 }
        );
    }
}
