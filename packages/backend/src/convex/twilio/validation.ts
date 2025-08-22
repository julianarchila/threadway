import { z } from 'zod';
import { ok, err } from 'neverthrow';

// Base Twilio webhook schema with all standard parameters
const TwilioBaseSchema = z.object({
  // Core identifiers (required for all messages)
  MessageSid: z.string().min(34).max(34), // 34 character unique identifier
  SmsSid: z.string().optional(), // Deprecated, same as MessageSid
  SmsMessageSid: z.string().optional(), // Deprecated, same as MessageSid
  AccountSid: z.string().min(34).max(34), // 34 character account id
  MessagingServiceSid: z.string().optional(), // 34 character messaging service id
  
  // Message routing
  From: z.string(), // Phone number or channel address that sent the message
  To: z.string(), // Phone number or channel address of recipient
  
  // Message content
  Body: z.string().optional(), // Text body, up to 1600 characters
  NumMedia: z.string().optional().default('0'), // Number of media items
  NumSegments: z.string().optional().default('1'), // Number of message segments
  
  // API metadata
  ApiVersion: z.string().optional(),
}).catchall(z.string().optional()); // Allow additional parameters as Twilio may add new ones

// Media parameters schema (dynamic MediaUrl0, MediaContentType0, etc.)
const MediaParametersSchema = z.object({}).catchall(z.string().optional());

// WhatsApp-specific parameters
const WhatsAppParametersSchema = z.object({
  // WhatsApp profile information
  ProfileName: z.string().optional(), // Sender's WhatsApp profile name
  WaId: z.string().optional(), // Sender's WhatsApp ID (typically phone number)
  
  // Message forwarding status
  Forwarded: z.string().optional(), // "true" if message has been forwarded once
  FrequentlyForwarded: z.string().optional(), // "true" if frequently forwarded
  
  // Quick reply buttons
  ButtonText: z.string().optional(), // Text of Quick reply button
  
  // Location sharing (for WhatsApp location messages)
  Latitude: z.string().optional(), // Latitude value of shared location
  Longitude: z.string().optional(), // Longitude value of shared location
  Address: z.string().optional(), // Address of shared location
  Label: z.string().optional(), // Label or name of shared location
  
  // Reply context (for replies to previous messages)
  OriginalRepliedMessageSender: z.string().optional(), // Sender of original message
  OriginalRepliedMessageSid: z.string().optional(), // SID of original message
  
}).catchall(z.string().optional());

// Incoming message schema (we only handle incoming messages for this endpoint)
const TwilioIncomingMessageSchema = TwilioBaseSchema
  .extend(MediaParametersSchema.shape)
  .extend(WhatsAppParametersSchema.shape);

// Inferred types
export type TwilioIncomingMessage = z.infer<typeof TwilioIncomingMessageSchema>;

/**
 * Parse and validate Twilio incoming message webhook
 */
export const parseTwilioWebhook = async (rawData: Record<string, FormDataEntryValue>) => {
  const validationResult = TwilioIncomingMessageSchema.safeParse(rawData);

  if (!validationResult.success) {
    return err(`Invalid Twilio incoming message webhook: ${validationResult.error.message}`);
  }

  return ok({
    data: validationResult.data,
    rawData,
  });
};
