
import {err, ok} from "neverthrow"
import { AuthError } from "./error";

/**
 * Normalize WhatsApp phone number from Twilio webhook
 * Converts "whatsapp:+1234567890" to "+1234567890"
 */
export function normalizeWhatsAppPhoneNumber(twilioPhoneNumber: string): string {
    return twilioPhoneNumber.replace(/^whatsapp:/, '');
}

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phoneNumber: string) => {
    const normalized = normalizeWhatsAppPhoneNumber(phoneNumber);

    // Basic validation - should start with + and contain only digits
    if (!normalized.match(/^\+[1-9]\d{1,14}$/)) {
        return err(new AuthError('INVALID_PHONE_NUMBER', `Invalid phone number format: ${phoneNumber}`));
    }

    return ok(normalized);
};