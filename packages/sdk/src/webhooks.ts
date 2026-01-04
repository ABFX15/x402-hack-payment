import crypto from 'crypto';
import type { WebhookPayload, WebhookEventType, Payment } from './types';

/**
 * Webhook utilities for verifying and handling payment events
 */

/**
 * Generate a webhook signature for a payload
 * @param payload - The payload to sign
 * @param secret - The webhook secret
 * @returns The HMAC-SHA256 signature
 */
export function generateWebhookSignature(payload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

/**
 * Verify a webhook signature
 * @param payload - The raw request body (string)
 * @param signature - The signature from the X-Settlr-Signature header
 * @param secret - Your webhook secret
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = generateWebhookSignature(payload, secret);

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

/**
 * Parse and verify a webhook payload
 * @param rawBody - The raw request body
 * @param signature - The signature from headers
 * @param secret - Your webhook secret
 * @returns The parsed and verified payload
 * @throws Error if signature is invalid
 */
export function parseWebhookPayload(
    rawBody: string,
    signature: string,
    secret: string
): WebhookPayload {
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
        throw new Error('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    return payload;
}

/**
 * Webhook event handler type
 */
export type WebhookHandler = (event: WebhookPayload) => Promise<void> | void;

/**
 * Webhook event handlers map
 */
export interface WebhookHandlers {
    'payment.created'?: WebhookHandler;
    'payment.completed'?: WebhookHandler;
    'payment.failed'?: WebhookHandler;
    'payment.expired'?: WebhookHandler;
    'payment.refunded'?: WebhookHandler;
    'subscription.created'?: WebhookHandler;
    'subscription.renewed'?: WebhookHandler;
    'subscription.cancelled'?: WebhookHandler;
    'subscription.expired'?: WebhookHandler;
}

/**
 * Create a webhook handler middleware
 * 
 * @example Express.js
 * ```typescript
 * import express from 'express';
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 * 
 * const app = express();
 * 
 * app.post('/webhooks/settlr', 
 *   express.raw({ type: 'application/json' }),
 *   createWebhookHandler({
 *     secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *     handlers: {
 *       'payment.completed': async (event) => {
 *         console.log('Payment completed:', event.payment.id);
 *         await fulfillOrder(event.payment.orderId);
 *       },
 *       'payment.failed': async (event) => {
 *         console.log('Payment failed:', event.payment.id);
 *         await notifyCustomer(event.payment.orderId);
 *       },
 *     },
 *   })
 * );
 * ```
 * 
 * @example Next.js API Route
 * ```typescript
 * // pages/api/webhooks/settlr.ts
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 * 
 * export const config = { api: { bodyParser: false } };
 * 
 * export default createWebhookHandler({
 *   secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *   handlers: {
 *     'payment.completed': async (event) => {
 *       await fulfillOrder(event.payment.orderId);
 *     },
 *   },
 * });
 * ```
 */
export function createWebhookHandler(options: {
    secret: string;
    handlers: WebhookHandlers;
    onError?: (error: Error) => void;
}) {
    const { secret, handlers, onError } = options;

    return async (req: any, res: any) => {
        try {
            // Get raw body
            let rawBody: string;
            if (typeof req.body === 'string') {
                rawBody = req.body;
            } else if (Buffer.isBuffer(req.body)) {
                rawBody = req.body.toString('utf8');
            } else {
                rawBody = JSON.stringify(req.body);
            }

            // Get signature from headers
            const signature = req.headers['x-settlr-signature'] as string;

            if (!signature) {
                res.status(400).json({ error: 'Missing signature header' });
                return;
            }

            // Parse and verify
            const event = parseWebhookPayload(rawBody, signature, secret);

            // Call appropriate handler
            const handler = handlers[event.type];
            if (handler) {
                await handler(event);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            if (onError && error instanceof Error) {
                onError(error);
            }

            if (error instanceof Error && error.message === 'Invalid webhook signature') {
                res.status(401).json({ error: 'Invalid signature' });
            } else {
                res.status(500).json({ error: 'Webhook processing failed' });
            }
        }
    };
}

/**
 * Send a webhook notification (used internally by Settlr)
 * @internal
 */
export async function sendWebhook(
    url: string,
    secret: string,
    event: {
        type: WebhookEventType;
        payment: Payment;
    }
): Promise<boolean> {
    const payload: WebhookPayload = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: event.type,
        payment: event.payment,
        timestamp: new Date().toISOString(),
        signature: '', // Will be set below
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, secret);

    // Update payload with signature
    payload.signature = signature;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Settlr-Signature': signature,
            },
            body: JSON.stringify(payload),
        });

        return response.ok;
    } catch {
        return false;
    }
}
