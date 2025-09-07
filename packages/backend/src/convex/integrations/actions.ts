"use node"

import { v } from "convex/values";
import { fromAsyncThrowable } from "neverthrow";

import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

import { composio } from "../../lib/composio";
import { validateAuthConfigId, validateUserAuth } from "./utils";
import { handleExistingConnection, createNewConnection } from "./helpers";

// =============================================================================
// Public Actions
// =============================================================================

export const initiateConnection = action({
  args: {
    authConfigId: v.string(),
  },
  handler: async (ctx, args) => {
    const userResult = await validateUserAuth(ctx);
    if (userResult.isErr()) throw userResult.error;
    const userId = userResult.value;

    const authConfigValidation = validateAuthConfigId(args.authConfigId);
    if (authConfigValidation.isErr()) throw authConfigValidation.error;

    const existingResult = await handleExistingConnection(ctx, userId, args.authConfigId);
    if (existingResult.isErr()) throw existingResult.error;
    if (existingResult.value) {
      return existingResult.value; // { redirectUrl }
    }

    const creationResult = await createNewConnection(ctx, userId, args.authConfigId);
    if (creationResult.isErr()) throw creationResult.error;
    return creationResult.value; // { redirectUrl }
  },
});

// =============================================================================
// Internal Actions
// =============================================================================

export const awaitConnectionStatus = internalAction({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const { connectionId } = args;

    const result = await fromAsyncThrowable(
      () => composio.connectedAccounts.waitForConnection(connectionId, 120000)
    )();

    if (result.isOk()) {
      const connectedAccount = result.value;
      const toolkitSlug = connectedAccount.toolkit?.slug || "";

      await ctx.runMutation(internal.integrations.mutations.markConnectionAsActive, {
        connectionId,
        toolkitSlug,
      });
    } else {
      await ctx.runMutation(internal.integrations.mutations.removeFailedConnection, {
        connectionId,
      });
    }
  },
});

export const deleteComposioConnection = internalAction({
  args: {
    connectionId: v.string(),
  },
  handler: async (_ctx, args) => {
    await composio.connectedAccounts.delete(args.connectionId);
  },
});