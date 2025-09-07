

import type { Id } from "../_generated/dataModel";
import { TOOLKIT_AUTH_CONFIG } from "../../lib/composio/connections";
import { betterAuthComponent } from "../auth";
import { ActionCtx, GenericCtx } from "../_generated/server";

// Helper function to validate auth config ID
export function validateAuthConfigId(authConfigId: string): void {
  if (!Array.from(TOOLKIT_AUTH_CONFIG.values()).find(c => c === authConfigId)) {
    throw new Error("Invalid authConfigId");
  }
}

// Helper function to validate authentication
export async function validateUserAuth(ctx: GenericCtx): Promise<Id<"users">> {
  const userId = await betterAuthComponent.getAuthUserId(ctx) as Id<"users"> | null;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}
