"use node"

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { composio } from "../../lib/composio";
import type { ActionCtx } from "../_generated/server";
import { Result, ok, err, fromAsyncThrowable } from "neverthrow";
import { IntegrationsError } from "./error";

/**
 * Checks for an existing connection for the given user and authConfigId.
 * - If none exists: returns ok(null)
 * - If ACTIVE exists: returns err(IntegrationsError)
 * - If INITIATED exists and refresh returns a redirect: schedules waiter and returns ok({ redirectUrl })
 */
export async function handleExistingConnection(
  ctx: ActionCtx,
  userId: Id<"users">,
  authConfigId: string
): Promise<Result<{ redirectUrl: string } | null, IntegrationsError>> {
  const existingConnection = await ctx.runQuery(
    internal.integrations.queries.getUserConnectionByAuthConfigId,
    { authConfigId, userId }
  );

  if (!existingConnection) {
    return ok(null);
  }

  if (existingConnection.status === "ACTIVE") {
    return err(
      new IntegrationsError(
        "INTEGRATION_CREATION_FAILED",
        "You already have an active connection for this integration"
      )
    );
  }

  if (existingConnection.status === "INITIATED") {
    const refreshRes = await fromAsyncThrowable(() =>
      composio.connectedAccounts.refresh(existingConnection.connectionId)
    )();

    if (refreshRes.isErr()) {
      return err(
        new IntegrationsError(
          "INTEGRATION_QUERY_FAILED",
          "Failed to refresh connection",
          refreshRes.error
        )
      );
    }

    const refreshed = refreshRes.value;
    if (refreshed.redirect_url) {
      await ctx.scheduler.runAfter(
        100,
        internal.integrations.actions.awaitConnectionStatus,
        { connectionId: existingConnection.connectionId }
      );
      return ok({ redirectUrl: refreshed.redirect_url });
    }
  }

  return ok(null);
}

/**
 * Initiates a new connection for a user and schedules a waiter to observe status changes.
 * Returns ok({ redirectUrl }) on success or err(IntegrationsError) on failure.
 */
export async function createNewConnection(
  ctx: ActionCtx,
  userId: Id<"users">,
  authConfigId: string
): Promise<Result<{ redirectUrl: string }, IntegrationsError>> {
  const initRes = await fromAsyncThrowable(() =>
    composio.connectedAccounts.initiate(userId, authConfigId, {})
  )();

  if (initRes.isErr()) {
    return err(
      new IntegrationsError(
        "INTEGRATION_CREATION_FAILED",
        "Failed to initiate connection",
        initRes.error
      )
    );
  }

  const connRequest = initRes.value;

  if (!connRequest.redirectUrl) {
    return err(
      new IntegrationsError(
        "INTEGRATION_CREATION_FAILED",
        "Failed to get redirect URL"
      )
    );
  }

  await ctx.runMutation(internal.integrations.mutations.createPendingConnection, {
    connectionId: connRequest.id,
    userId,
    authConfigId,
  });

  await ctx.scheduler.runAfter(
    100,
    internal.integrations.actions.awaitConnectionStatus,
    { connectionId: connRequest.id }
  );

  return ok({ redirectUrl: connRequest.redirectUrl });
}