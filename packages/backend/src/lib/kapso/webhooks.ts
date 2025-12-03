/**
 * Kapso webhook utilities
 * Handles signature verification and payload validation
 */

const KAPSO_WEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET;

/**
 * Verify Kapso webhook signature using HMAC SHA256
 */
export async function verifyWebhookSignature(
    rawBody: string,
    signature: string | null
): Promise<boolean> {
    if (!KAPSO_WEBHOOK_SECRET) {
        console.warn("⚠️ KAPSO_WEBHOOK_SECRET not configured - skipping signature verification");
        return true; // Allow in development, but log warning
    }

    if (!signature) {
        return false;
    }

    try {
        const expectedSignature = signature.replace("sha256=", "");

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(KAPSO_WEBHOOK_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(rawBody)
        );

        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const hashHex = hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return hashHex === expectedSignature;
    } catch (error) {
        console.error("Error verifying webhook signature:", error);
        return false;
    }
}

/**
 * Parse and validate Kapso webhook payload
 */
export interface KapsoWebhookPayload {
    test?: boolean;
    phone_number_id?: string;
    customer?: { id: string };
    project?: { id: string };
}

export function parseWebhookPayload(rawBody: string): KapsoWebhookPayload {
    return JSON.parse(rawBody);
}

export function isTestWebhook(payload: KapsoWebhookPayload): boolean {
    return payload.test === true;
}

export function validatePhoneNumberCreatedPayload(
    payload: KapsoWebhookPayload
): { customerId: string; phoneNumberId: string; projectId?: string } | null {
    const customerId = payload.customer?.id;
    const phoneNumberId = payload.phone_number_id;

    if (!customerId || !phoneNumberId) {
        return null;
    }

    return {
        customerId,
        phoneNumberId,
        projectId: payload.project?.id,
    };
}
