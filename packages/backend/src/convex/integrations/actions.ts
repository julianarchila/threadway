"use node"

import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { composio } from "../../lib/composio";
import { TOOLKIT_AUTH_CONFIG } from "../../lib/composio/connections";
import { fromAsyncThrowable } from "neverthrow";

// Type definitions
type ConnectionStatus = "ACTIVE" | "INITIATED" | "INITIALIZING";

interface ExistingConnection {
  connectionId: string;
  status: ConnectionStatus;
}

interface ConnectionResponse {
  redirectUrl: string;
}

interface ComposioConnectionRequest {
  id: string;
  redirectUrl?: string | null;
}


// Helper function to validate authentication  
async function validateUserAuth(ctx: any): Promise<Id<"users">> {
  const userId = await betterAuthComponent.getAuthUserId(ctx) as Id<"users"> | null;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

// Helper function to validate auth config ID
function validateAuthConfigId(authConfigId: string): void {
  if (!Array.from(TOOLKIT_AUTH_CONFIG.values()).find(c => c === authConfigId)) {
    throw new Error("Invalid authConfigId");
  }
}

// Helper function to handle existing connections
async function handleExistingConnection(
  ctx: any, 
  userId: Id<"users">, 
  authConfigId: string
): Promise<ConnectionResponse | null> {
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
async function createNewConnection(
  ctx: any, 
  userId: Id<"users">, 
  authConfigId: string
): Promise<ConnectionResponse> {
  const connRequest: ComposioConnectionRequest = await composio.connectedAccounts.initiate(userId, authConfigId, {});
  
  console.debug("Connection request", connRequest);

  if (!connRequest.redirectUrl) {
    throw new Error("Failed to get redirect URL");
  }

  await ctx.runMutation(internal.integrations.mutations.creteInitialConnection, {
    connectionId: connRequest.id,
    userId: userId,
    authConfigId: authConfigId,
  });

  await ctx.scheduler.runAfter(100, internal.integrations.actions.awaitConnectionStatus, {
    connectionId: connRequest.id,
  });

  return { redirectUrl: connRequest.redirectUrl };
}

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
        await ctx.runMutation(internal.integrations.mutations.successfulConnection, {
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
      
      // TODO: Consider updating the connection status to "FAILED" in the database
      // This would require adding a failedConnection mutation
      // await ctx.runMutation(internal.integrations.mutations.failedConnection, {
      //   connectionId,
      //   error: error.message || "Connection failed or timed out",
      // });
    }
  }
})




