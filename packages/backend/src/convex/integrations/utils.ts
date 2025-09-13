import type { DataModel, Id } from "../_generated/dataModel";
import { AUTH_CONFIG_ID_SET } from "../../lib/composio/connections";
import { authComponent } from "../auth";
import { ok, err, Result } from "neverthrow";
import { IntegrationsError } from "./error";
import { GenericCtx } from "@convex-dev/better-auth";

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
  ctx: any,
): Promise<Result<Id<"users">, IntegrationsError>> {
  const userId = (await authComponent.safeGetAuthUser(ctx))?.userId as Id<"users"> | null;
  if (!userId) {
    return err(new IntegrationsError("INTEGRATION_QUERY_FAILED", "User not authenticated"));
  }
  return ok(userId);
}
