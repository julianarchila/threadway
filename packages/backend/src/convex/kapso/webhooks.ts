import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Unified webhook handler for Kapso WhatsApp connection
 * Handles the "WhatsApp Phone Number Created" event from Kapso
 * This processes the webhook POST request with JSON body
 */
export const handleKapsoWebhook = httpAction(async (ctx, request) => {
  try {
    // Parse JSON body from Kapso webhook
    const body = await request.json();

    console.log("📨 Kapso webhook received:", body);

    // Check if it's a test webhook
    if (body.test) {
      console.log("🧪 Test webhook received");
      return new Response(JSON.stringify({ status: "ok", message: "Test webhook received" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For real webhooks, extract the data
    // Project webhook format: { phone_number_id, project: { id }, customer: { id } }
    const phone_number_id = body.phone_number_id;
    const customer_id = body.customer?.id;
    const project_id = body.project?.id;

    if (!customer_id || !phone_number_id) {
      console.error("❌ Missing required fields:", body);
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("✅ Valid webhook data:", {
      customer_id,
      phone_number_id,
      project_id,
    });

    // Find user by Kapso customer ID
    const user = await ctx.runQuery(internal.kapso.helpers.getUserByKapsoCustomerId, {
      kapsoCustomerId: customer_id,
    });

    if (!user) {
      console.error(`❌ User not found for Kapso customer ID: ${customer_id}`);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("👤 Found user:", user._id);

    // Update user's WhatsApp connection details
    // Note: connection_type and waba_id come from other Kapso APIs, not this webhook
    await ctx.runMutation(internal.kapso.mutations.updateWhatsAppConnection, {
      userId: user._id,
      phoneNumberId: phone_number_id,
      phoneNumber: undefined, // Will be populated later from Kapso API
      connectionType: "coexistence", // Default, can be updated later
      wabaId: undefined,
    });

    console.log("✅ WhatsApp connection updated successfully");

    return new Response(JSON.stringify({ status: "ok", message: "Webhook processed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error handling Kapso webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
