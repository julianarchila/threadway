"use node"

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { composio } from "../../lib/composio";
import { ActionCtx } from "../_generated/server";


// Helper function to handle existing connections
export async function handleExistingConnection(
  ctx: ActionCtx,
  userId: Id<"users">,
  authConfigId: string
) {
  const existingConnection = await ctx.runQuery(
    internal.integrations.queries.getUserConnectionByAuthConfigId,
    { authConfigId, userId }
  );

  if (!existingConnection) {
    return null;
  }

  if (existingConnection.status === "ACTIVE") {
    throw new Error("You already have an active connection for this integration");
  }

  if (existingConnection.status === "INITIATED" || existingConnection.status === "INITIALIZING") {
    const res = await composio.connectedAccounts.refresh(existingConnection.connectionId);
    if (res.redirect_url) {
      await ctx.scheduler.runAfter(100, internal.integrations.actions.awaitConnectionStatus, {
        connectionId: existingConnection.connectionId,
      });
      return { redirectUrl: res.redirect_url };
    }
  }

  return null;
}


// Helper function to create new connection
export async function createNewConnection(
  ctx: ActionCtx,
  userId: Id<"users">,
  authConfigId: string
) {
  const connRequest = await composio.connectedAccounts.initiate(userId, authConfigId, {});

  console.debug("Connection request", connRequest);

  if (!connRequest.redirectUrl) {
    throw new Error("Failed to get redirect URL");
  }

  await ctx.runMutation(internal.integrations.mutations.createPendingConnection, {
    connectionId: connRequest.id,
    userId: userId,
    authConfigId: authConfigId,
  });

  await ctx.scheduler.runAfter(100, internal.integrations.actions.awaitConnectionStatus, {
    connectionId: connRequest.id,
  });

  return { redirectUrl: connRequest.redirectUrl };
}
