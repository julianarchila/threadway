
"use node"

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

import twilio from 'twilio';
import { sendOTP } from "./utils";

export const validateTwilioSignatureAction = internalAction({
  args: {
    signature: v.string(),
    url: v.string(),
    params: v.any()
  },
  handler: async (ctx, { signature, url, params }) => {
    const isValidSignature = twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN || "", signature, url, params);
    return isValidSignature;
  }
})

export const createTwiMLResponseAction = internalAction({
  args: {
    message: v.string()
  },
  handler: async (ctx, { message }) => {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(message);
    return twiml.toString();
  }
})

export const sendOTPAction = internalAction({
  args: {
    phoneNumber: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { phoneNumber, code }) => {
    const result = await sendOTP(phoneNumber, code);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }
})
