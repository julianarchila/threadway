import { z } from "zod";

// Phone number validation schema
export const phoneNumberSchema = z.string()
    .regex(/^[1-9]\d{1,14}$/, "Invalid phone number format");

// Access type validation
export const accessTypeSchema = z.enum(["ALL", "SPECIFIC"]);

// Alias validation
export const aliasSchema = z.string().min(1).max(50).optional();

// Phone country code validation
export const phoneCountryCodeSchema = z.string().min(1).max(5);

// Create authorized phone validation
export const createAuthorizedPhoneSchema = z.object({
    phoneNumber: phoneNumberSchema,
    phoneCountryCode: phoneCountryCodeSchema,
    alias: aliasSchema,
    accessType: accessTypeSchema,
});

// Type exports
export type AccessType = z.infer<typeof accessTypeSchema>;
export type CreateAuthorizedPhoneInput = z.infer<typeof createAuthorizedPhoneSchema>;
