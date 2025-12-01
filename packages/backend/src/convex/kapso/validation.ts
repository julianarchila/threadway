import { z } from "zod";

/**
 * Validation schema for Kapso webhook callback parameters
 * These are query parameters sent by Kapso after successful/failed setup
 */
export const kapsoSuccessCallbackSchema = z.object({
  customer_id: z.string(),
  phone_number_id: z.string(),
  phone_number: z.string().optional(),
  connection_type: z.enum(["coexistence", "dedicated"]),
  waba_id: z.string().optional(),
});

export const kapsoFailureCallbackSchema = z.object({
  customer_id: z.string(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type KapsoSuccessCallback = z.infer<typeof kapsoSuccessCallbackSchema>;
export type KapsoFailureCallback = z.infer<typeof kapsoFailureCallbackSchema>;
