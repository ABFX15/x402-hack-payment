/**
 * Sumsub KYC Integration
 * 
 * Documentation: https://docs.sumsub.com/
 * 
 * SETUP REQUIRED:
 * 1. Log into Sumsub dashboard (https://cockpit.sumsub.com)
 * 2. Go to "Applicant levels" or "Verification levels"
 * 3. Create levels matching the names below (or update .env with your level names)
 * 
 * Environment Variables:
 * - SUMSUB_APP_TOKEN: Your API token (sbx: prefix for sandbox)
 * - SUMSUB_SECRET_KEY: Your secret key
 * - SUMSUB_LEVEL_BASIC: (optional) Name of basic KYC level
 * - SUMSUB_LEVEL_GAMING: (optional) Name of gaming KYC level  
 * - SUMSUB_LEVEL_ENHANCED: (optional) Name of enhanced KYC level
 * 
 * Flow:
 * 1. Merchant enables KYC for their checkout
 * 2. Customer initiates payment
 * 3. We check if customer is verified (by wallet/email)
 * 4. If not, redirect to Sumsub verification
 * 5. Once verified, allow payment
 * 6. Store verification status (not PII)
 */

import crypto from "crypto";

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN || "";
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY || "";
const SUMSUB_BASE_URL = "https://api.sumsub.com";

// Level names - configure in Sumsub dashboard or via environment variables
// Default names shown - create these in your Sumsub dashboard or override with env vars
export const KYC_LEVELS = {
    BASIC: process.env.SUMSUB_LEVEL_BASIC || "basic-kyc-level", // ID + selfie
    GAMING: process.env.SUMSUB_LEVEL_GAMING || "gaming-kyc-level", // ID + selfie + age verification
    ENHANCED: process.env.SUMSUB_LEVEL_ENHANCED || "enhanced-kyc-level", // ID + selfie + proof of address
} as const;

export type KYCLevel = (typeof KYC_LEVELS)[keyof typeof KYC_LEVELS];

interface SumsubSignature {
    ts: number;
    signature: string;
}

/**
 * Generate HMAC signature for Sumsub API requests
 */
function generateSignature(
    method: string,
    endpoint: string,
    body?: string
): SumsubSignature {
    const ts = Math.floor(Date.now() / 1000);
    const sigString = ts + method.toUpperCase() + endpoint + (body || "");
    const signature = crypto
        .createHmac("sha256", SUMSUB_SECRET_KEY)
        .update(sigString)
        .digest("hex");

    return { ts, signature };
}

/**
 * Make authenticated request to Sumsub API
 */
async function sumsubRequest<T>(
    method: string,
    endpoint: string,
    body?: object
): Promise<T> {
    const bodyString = body ? JSON.stringify(body) : undefined;
    const { ts, signature } = generateSignature(method, endpoint, bodyString);

    console.log(`[Sumsub] ${method} ${endpoint}`);

    const response = await fetch(`${SUMSUB_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-App-Token": SUMSUB_APP_TOKEN,
            "X-App-Access-Ts": ts.toString(),
            "X-App-Access-Sig": signature,
        },
        body: bodyString,
    });

    if (!response.ok) {
        const error = await response.text();
        console.error(`[Sumsub] Error ${response.status}:`, error);
        throw new Error(`Sumsub API error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Create or get an applicant (user) in Sumsub
 */
export async function createApplicant(
    externalUserId: string,
    levelName: KYCLevel = KYC_LEVELS.BASIC
): Promise<{ id: string; inspectionId: string }> {
    const endpoint = `/resources/applicants?levelName=${levelName}`;

    const result = await sumsubRequest<{
        id: string;
        inspectionId: string;
    }>("POST", endpoint, {
        externalUserId,
    });

    return result;
}

/**
 * Get applicant by external user ID
 */
export async function getApplicantByExternalId(
    externalUserId: string
): Promise<{ id: string; review: { reviewStatus: string; reviewResult?: { reviewAnswer?: string } } } | null> {
    try {
        const endpoint = `/resources/applicants/-;externalUserId=${encodeURIComponent(
            externalUserId
        )}/one`;
        const result = await sumsubRequest<{
            id: string;
            review: { reviewStatus: string; reviewResult?: { reviewAnswer?: string } };
        }>("GET", endpoint);
        return result;
    } catch {
        return null;
    }
}

/**
 * Generate access token for WebSDK
 * This token is used client-side to initialize the Sumsub WebSDK
 */
export async function generateAccessToken(
    externalUserId: string,
    levelName: KYCLevel = KYC_LEVELS.BASIC,
    ttlInSecs: number = 1200 // 20 minutes
): Promise<{ token: string; userId: string }> {
    const endpoint = `/resources/accessTokens?userId=${encodeURIComponent(
        externalUserId
    )}&levelName=${levelName}&ttlInSecs=${ttlInSecs}`;

    const result = await sumsubRequest<{ token: string; userId: string }>(
        "POST",
        endpoint
    );

    return result;
}

/**
 * Get applicant verification status
 */
export async function getVerificationStatus(
    applicantId: string
): Promise<{
    reviewStatus: "init" | "pending" | "queued" | "completed" | "onHold";
    reviewResult?: {
        reviewAnswer: "GREEN" | "RED" | "ERROR";
        rejectLabels?: string[];
        reviewRejectType?: string;
    };
}> {
    const endpoint = `/resources/applicants/${applicantId}/requiredIdDocsStatus`;

    const result = await sumsubRequest<{
        reviewStatus: "init" | "pending" | "queued" | "completed" | "onHold";
        reviewResult?: {
            reviewAnswer: "GREEN" | "RED" | "ERROR";
            rejectLabels?: string[];
            reviewRejectType?: string;
        };
    }>("GET", endpoint);

    return result;
}

/**
 * Check if a user is verified
 */
export async function isUserVerified(externalUserId: string): Promise<boolean> {
    const applicant = await getApplicantByExternalId(externalUserId);

    if (!applicant) {
        return false;
    }

    return applicant.review?.reviewStatus === "completed";
}

/**
 * Webhook payload types
 */
export interface SumsubWebhookPayload {
    applicantId: string;
    inspectionId: string;
    correlationId: string;
    externalUserId: string;
    type:
    | "applicantCreated"
    | "applicantPending"
    | "applicantReviewed"
    | "applicantOnHold"
    | "applicantActionPending"
    | "applicantActionReviewed"
    | "applicantReset"
    | "applicantDeleted";
    reviewStatus: "init" | "pending" | "queued" | "completed" | "onHold";
    reviewResult?: {
        reviewAnswer: "GREEN" | "RED" | "ERROR";
        rejectLabels?: string[];
        moderationComment?: string;
    };
    createdAt: string;
    clientId: string;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", SUMSUB_SECRET_KEY)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
