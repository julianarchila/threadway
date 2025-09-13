import {
  type AuthFunctions,
  createClient
} from "@convex-dev/better-auth";
import { api, components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import type { Id, DataModel } from "./_generated/dataModel";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;

// Initialize the component
export const authComponent = createClient<DataModel>(
  components.betterAuth,
  {
    authFunctions,
    triggers: {
      user: {

        onCreate: async (ctx, authUser) => {
          const userId = await ctx.db.insert("users", {
            phoneNumber: authUser.phoneNumber || "",
            name: authUser.name,
          });

          await authComponent.setUserId(ctx, authUser._id, userId)


        },

        // Delete the user when they are deleted from Better Auth
        onDelete: async (ctx, authUser) => {
          await ctx.db.delete(authUser._id as Id<"users">);
        },
      }
    }
  }
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()


