"use node"
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { composio } from "../../lib/composio";
import { internal } from "../_generated/api";



export const loadUserTools = internalAction({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
composio 
    // const userToolKits = await internal.integrations.queries.getUserConnectedToolkits({userId: args.userId})
    const userToolKits = await ctx.runQuery(internal.integrations.queries.getUserConnectedToolkits, {userId: args.userId})
    const tools = await composio.tools.get(args.userId, {
      toolkits: userToolKits
    })


    console.log("[loadUserTools]: ", {
      userId: args.userId,
      tools
    })

  }
}) 

