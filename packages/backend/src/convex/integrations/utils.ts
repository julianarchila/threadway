import type { Id } from "../_generated/dataModel";
import { AUTH_CONFIG_ID_SET } from "../../lib/composio/connections";
import { betterAuthComponent } from "../auth";
import type { GenericCtx } from "../_generated/server";
import { ok, err, Result } from "neverthrow";
import { IntegrationsError } from "./error";

/**
 * Validate an authConfigId against the env-aware registry.
 * Returns a Result<void, IntegrationsError> instead of throwing.
 */
export function validateAuthConfigId(authConfigId: string): Result<void, IntegrationsError> {
  if (!AUTH_CONFIG_ID_SET.has(authConfigId)) {
    return err(new IntegrationsError("INTEGRATION_LOOKUP_FAILED", "Invalid authConfigId"));
  }
  return ok(undefined);
}

/**
 * Validate that a user is authenticated.
 * Returns a Result<Id<"users">, IntegrationsError> instead of throwing.
 */
export async function validateUserAuth(
  ctx: GenericCtx
): Promise<Result<Id<"users">, IntegrationsError>> {
  const userId = (await betterAuthComponent.getAuthUserId(ctx)) as Id<"users"> | null;
  if (!userId) {
    return err(new IntegrationsError("INTEGRATION_QUERY_FAILED", "User not authenticated"));
  }
  return ok(userId);
}