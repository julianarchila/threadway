import crypto from 'crypto';

const KAPSO_WEEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET || '';

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
