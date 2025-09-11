import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";

// Get all authorized phones for the authenticated user (as owner)
export const getUserAuthorizedPhones = query({
    args: {
        status: v.optional(v.union(v.literal("INVITED"), v.literal("ACTIVE"), v.literal("REVOKED"))),
    },
    handler: async (ctx, args) => {
        // Get user data from Better Auth - exactly like getCurrentUser
        const userMetadata = await betterAuthComponent.getAuthUser(ctx);
        if (!userMetadata) {
            return [];
        }

        const userId = userMetadata.userId as Id<"users">;

        let query = ctx.db
            .query("authorizedPhones")
            .withIndex("by_owner", (q) => q.eq("ownerId", userId));

        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        const authorizedPhones = await query
            .order("desc")
            .collect();

        return authorizedPhones;
    },
});

// Check if a specific authorized phone has access to a workflow
export const checkWorkflowAccess = query({
    args: {
        authorizedPhoneId: v.id("authorizedPhones"),
        workflowId: v.id("workflows"),
    },
    handler: async (ctx, args) => {
        const access = await ctx.db
            .query("phoneWorkflowAccess")
            .withIndex("by_phone_and_workflow", (q) =>
                q.eq("authorizedPhoneId", args.authorizedPhoneId)
                    .eq("workflowId", args.workflowId)
            )
            .first();

        return {
            hasAccess: !!access,
            accessId: access?._id || null,
            grantedAt: access?.grantedAt || null,
        };
    },
});
