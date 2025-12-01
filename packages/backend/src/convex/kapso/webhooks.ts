import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { kapsoSuccessCallbackSchema, kapsoFailureCallbackSchema } from "./validation";

/**
 * Webhook handler for successful WhatsApp connection
 * Kapso redirects here after user successfully connects their WhatsApp
 */
export const handleKapsoSuccess = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // Validate callback parameters
    const validationResult = kapsoSuccessCallbackSchema.safeParse(params);
    if (!validationResult.success) {
      console.error("Invalid Kapso success callback:", validationResult.error);
      return new Response("Invalid callback parameters", { status: 400 });
    }

    const { customer_id, phone_number_id, phone_number, connection_type, waba_id } = validationResult.data;

    // Find user by Kapso customer ID
    const user = await ctx.runQuery(internal.kapso.helpers.getUserByKapsoCustomerId, {
      kapsoCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for Kapso customer ID: ${customer_id}`);
      return new Response("User not found", { status: 404 });
    }

    // Update user's WhatsApp connection details
    await ctx.runMutation(internal.kapso.mutations.updateWhatsAppConnection, {
      userId: user._id,
      phoneNumberId: phone_number_id,
      phoneNumber: phone_number,
      connectionType: connection_type,
      wabaId: waba_id,
    });

    // Redirect to success page in the webapp
    const baseUrl = `${url.protocol}//${url.host}`;
    const redirectUrl = `${baseUrl}/whatsapp/connected`;
    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error("Error handling Kapso success webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

/**
 * Webhook handler for failed WhatsApp connection
 * Kapso redirects here if user fails to connect their WhatsApp
 */
export const handleKapsoFailure = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // Validate callback parameters
    const validationResult = kapsoFailureCallbackSchema.safeParse(params);
    if (!validationResult.success) {
      console.error("Invalid Kapso failure callback:", validationResult.error);
      return new Response("Invalid callback parameters", { status: 400 });
    }

    const { customer_id, error, error_description } = validationResult.data;

    console.error(
      `WhatsApp connection failed for customer ${customer_id}:`,
      error,
      error_description
    );

    // Redirect to error page in the webapp
    const baseUrl = `${url.protocol}//${url.host}`;
    let redirectUrl = `${baseUrl}/whatsapp/failed`;

    const queryParams = new URLSearchParams();
    if (error) {
      queryParams.set("error", error);
    }
    if (error_description) {
      queryParams.set("error_description", error_description);
    }

    if (queryParams.toString()) {
      redirectUrl += `?${queryParams.toString()}`;
    }

    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error("Error handling Kapso failure webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
