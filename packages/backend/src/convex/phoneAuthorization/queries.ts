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
