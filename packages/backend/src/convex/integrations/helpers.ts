import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";
import { IntegrationsError } from "./error";

export async function getAuthenticatedUser(ctx: any) {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
        throw new IntegrationsError('INTEGRATION_LOOKUP_FAILED', "User not authenticated");
    }

    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    if (!user) {
        throw new IntegrationsError('INTEGRATION_LOOKUP_FAILED', "User not found in database");
    }

    return { userMetadata, user };
}