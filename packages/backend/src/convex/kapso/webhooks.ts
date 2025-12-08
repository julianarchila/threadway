import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  isTestWebhook,
  validatePhoneNumberCreatedPayload,
} from "../../lib/kapso/webhooks";

/**
 * Webhook handler for Kapso "WhatsApp Phone Number Created" event
 * Triggered when a customer successfully connects their WhatsApp through a setup link
 */
export const handleKapsoWebhook = httpAction(async (ctx, request) => {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-kapso-signature");

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = parseWebhookPayload(rawBody);

    // Handle test webhooks
    if (isTestWebhook(payload)) {
      return new Response(
        JSON.stringify({ status: "ok", message: "Test webhook received" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate payload
    const validatedData = validatePhoneNumberCreatedPayload(payload);
    if (!validatedData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find user by Kapso customer ID
    const user = await ctx.runQuery(
      internal.kapso.helpers.getUserByKapsoCustomerId,
      { kapsoCustomerId: validatedData.customerId }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create WhatsApp connection record
    await ctx.runMutation(internal.kapso.mutations.updateWhatsAppConnection, {
      userId: user._id,
      phoneNumberId: validatedData.phoneNumberId,
      phoneNumber: undefined,
      connectionType: "coexistence",
      wabaId: undefined,
    });

    return new Response(
      JSON.stringify({ status: "ok", message: "Webhook processed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing Kapso webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
