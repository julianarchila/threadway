"use node"

import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { composio } from "../../lib/composio";
import { fromAsyncThrowable } from "neverthrow";
import { validateAuthConfigId, validateUserAuth } from "./utils";
import { handleExistingConnection,createNewConnection } from "./helpers";
import { v } from "convex/values";

// =============================================================================
// Public Actions
// =============================================================================


export const createConnectionWithUrl = action({
  args: {
    authConfigId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate user authentication
      const userId = await validateUserAuth(ctx);

      // Validate auth config ID
      validateAuthConfigId(args.authConfigId);

      // Check for and handle existing connections
      const existingConnectionResult = await handleExistingConnection(ctx, userId, args.authConfigId);
      if (existingConnectionResult) {
        return existingConnectionResult;
      }

      // Create new connection
      return await createNewConnection(ctx, userId, args.authConfigId);
    } catch (error) {
      console.error("Error in createConnectionWithUrl:", error);
      throw error;
    }
  }
})



export const awaitConnectionStatus = internalAction({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const { connectionId } = args;

    console.debug(`Starting to await connection status for connectionId: ${connectionId}`);

    const result = await fromAsyncThrowable(
      () => composio.connectedAccounts.waitForConnection(connectionId, 120000),
    )();

    if (result.isOk()) {
      const connectedAccount = result.value;
      const toolkitSlug = connectedAccount.toolkit?.slug || "";

      console.info(`Connection successful for connectionId: ${connectionId}, toolkit: ${toolkitSlug}`);

      try {
        await ctx.runMutation(internal.integrations.mutations.markConnectionAsActive, {
          connectionId,
          tolkitSlug: toolkitSlug,
        });
        console.debug(`Successfully updated connection status for connectionId: ${connectionId}`);
      } catch (mutationError) {
        console.error(`Failed to update successful connection status for connectionId: ${connectionId}`, mutationError);
        throw mutationError;
      }
    } else {
      const error = result.error;
      console.error(`Connection failed or timed out for connectionId: ${connectionId}`, error);

      await ctx.runMutation(internal.integrations.mutations.removeFailedConnection, {
        connectionId
      })
    }
  }
})






export const deleteComposioConnection = internalAction({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    await composio.connectedAccounts.delete(args.connectionId)

  }
})
