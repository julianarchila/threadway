import crypto from 'crypto';
import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';


const KAPSO_WEEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET || '';
export const KAPSO_PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID || '';

export function verifyWebhook(payload: any, signature: string) {
  const expected = crypto
    .createHmac('sha256', KAPSO_WEEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export const whatsappClient = new WhatsAppClient({
  baseUrl: 'https://app.kapso.ai/api/meta/',
  kapsoApiKey: process.env.KAPSO_API_KEY!
});
