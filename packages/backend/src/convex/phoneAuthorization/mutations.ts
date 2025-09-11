import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

import {
    createAuthorizedPhoneNotFoundError,
    createUserNotAuthorizedError,
    createPhoneAlreadyAuthorizedError,
    createRateLimitExceededError
} from "./error";
import {
    checkRateLimit,
    getRateLimitInfo
} from "./utils";
import {
    createAuthorizedPhoneSchema,
} from "./validations";

// Create a new authorized phone
export const createAuthorizedPhone = mutation({
    args: {
        phoneNumber: v.string(),
        phoneCountryCode: v.string(),
        alias: v.optional(v.string()),
        accessType: v.union(v.literal("ALL"), v.literal("SPECIFIC")),
    },
    handler: async (ctx, args) => {
        const userMetadata = await betterAuthComponent.getAuthUser(ctx);
        if (!userMetadata) {
            throw new Error("Not authenticated");
        }

        const ownerId = userMetadata.userId as Id<"users">;

        const validatedInput = createAuthorizedPhoneSchema.parse({
            phoneNumber: args.phoneNumber,
            phoneCountryCode: args.phoneCountryCode,
            alias: args.alias,
            accessType: args.accessType,
        });

        // Check rate limiting for phone invitations
        const recentInvitations = await ctx.db
            .query("authorizedPhones")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();

        if (!checkRateLimit(recentInvitations, "PHONE_INVITATIONS")) {
            const limitInfo = getRateLimitInfo("PHONE_INVITATIONS");
            throw createRateLimitExceededError(
                "phone invitations",
                limitInfo.maxAttempts,
                limitInfo.windowMinutes
            );
        }

        // Check if phone is already authorized by this owner
        const existingAuth = await ctx.db
            .query("authorizedPhones")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .filter((q) => q.eq(q.field("phoneNumber"), validatedInput.phoneNumber))
            .first();

        if (existingAuth) {
            throw createPhoneAlreadyAuthorizedError(validatedInput.phoneNumber, ownerId);
        }

        const now = Date.now();

        const authorizedPhoneId = await ctx.db.insert("authorizedPhones", {
            ownerId: ownerId,
            phoneNumber: validatedInput.phoneNumber,
            phoneCountryCode: validatedInput.phoneCountryCode,
            alias: validatedInput.alias,
            status: "ACTIVE",
            accessType: validatedInput.accessType,
            createdAt: now,
            updatedAt: now,
        });

        return authorizedPhoneId;

    },
});

// Delete authorized phone
export const deleteAuthorizedPhone = mutation({
    args: {
        authorizedPhoneId: v.id("authorizedPhones"),
    },
    handler: async (ctx, args) => {
        const userMetadata = await betterAuthComponent.getAuthUser(ctx);
        if (!userMetadata) {
            throw new Error("Not authenticated");
        }

        const ownerId = userMetadata.userId as Id<"users">;

        const authorizedPhone = await ctx.db.get(args.authorizedPhoneId);
        if (!authorizedPhone) {
            throw createAuthorizedPhoneNotFoundError(args.authorizedPhoneId);
        }

        if (authorizedPhone.ownerId !== ownerId) {
            throw createUserNotAuthorizedError(ownerId, args.authorizedPhoneId);
        }

        // Delete related phone workflow access records
        const accessRecords = await ctx.db
            .query("phoneWorkflowAccess")
            .withIndex("by_authorized_phone", (q) => q.eq("authorizedPhoneId", args.authorizedPhoneId))
            .collect();

        for (const record of accessRecords) {
            await ctx.db.delete(record._id);
        }

        // Delete the authorized phone
        await ctx.db.delete(args.authorizedPhoneId);

        return args.authorizedPhoneId;
    },
});