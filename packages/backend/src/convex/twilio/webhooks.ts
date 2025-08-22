
import { httpAction } from "../_generated/server"
import { api, internal } from "../_generated/api"
import { parseTwilioWebhook } from "./validation";
import { normalizeTwilioMessage } from "./normalizer";

export const WhatsappIncomingMessageWebhook = httpAction(async (ctx, request) => {
  console.log('📞 Twilio webhook received');
  
  const signature = request.headers.get('x-twilio-signature') ?? '';
  const url = request.url;
  const formData = await request.formData().catch(() => null);
  const params = Object.fromEntries(formData?.entries() ?? []);

  // 1. Validate signature (utility handles headers, URL, and body)
  const isValidSignature = await ctx.runAction(internal.twilio.actions.validateTwilioSignatureAction, {signature, url, params});
  if (!isValidSignature) {
    console.error('❌ Invalid or missing Twilio signature');
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse and validate Twilio webhook
  const webhookResult = await parseTwilioWebhook(params);
  if (webhookResult.isErr()) {
    console.error('❌ Twilio webhook parsing failed:', webhookResult.error);
    return new Response('Bad Request', { status: 400 });
  }

  const { data, rawData } = webhookResult.value;
  console.log('📋 Raw data:', rawData);

  // 3. Normalize and delegate to chatbot service
  const domain = normalizeTwilioMessage(data);

  // 4. Run agent
  const result = await ctx.runAction(internal.agent.actions.runAgentAction, { message: domain });

  return new Response(result, { status: 200 });
})
