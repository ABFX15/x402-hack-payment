import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, KYC_LEVELS, KYCLevel } from "@/lib/sumsub";

/**
 * POST /api/kyc/token
 * 
 * Generate a Sumsub access token for the WebSDK
 * 
 * Body:
 *   - userId: string (wallet address or email)
 *   - customerId: string (alternative to userId - wallet address)
 *   - merchantId: string (used with customerId to create unique ID)
 *   - level/levelName: KYCLevel (default: basic)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, customerId, merchantId, level, levelName } = body;

        // Support both userId and customerId:merchantId formats
        const externalUserId = userId || (customerId && merchantId ? `${customerId}:${merchantId}` : customerId);

        if (!externalUserId) {
            return NextResponse.json(
                { error: "userId or customerId is required" },
                { status: 400 }
            );
        }

        // Validate level if provided (support both 'level' and 'levelName')
        const requestedLevel = levelName || level;
        const kycLevel: KYCLevel = requestedLevel && Object.values(KYC_LEVELS).includes(requestedLevel)
            ? requestedLevel
            : KYC_LEVELS.BASIC;

        // Check if Sumsub is configured
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            return NextResponse.json(
                { error: "KYC service not configured" },
                { status: 503 }
            );
        }

        console.log(`[KYC Token] Generating token for ${externalUserId} with level ${kycLevel}`);

        const result = await generateAccessToken(externalUserId, kycLevel);

        console.log(`[KYC Token] Token generated successfully for ${result.userId}`);

        return NextResponse.json({
            token: result.token,
            userId: result.userId,
            applicantId: result.userId, // For compatibility
        });
    } catch (error) {
        console.error("[KYC Token] Error generating token:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate KYC token", details: message },
