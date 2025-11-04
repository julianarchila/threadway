
import { query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

const SUPER_SECRET = process.env.AGENT_SECRET

export const getUserByPhoneNumber = query({
  args: v.object({
    phoneNumber: v.string(),
    secret: v.string()
  }),
  handler: async (ctx, args) => {

    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope")
    }

    console.log("Looking up user by phone number:", args.phoneNumber)


    return ctx.db.query("users")
      .withIndex("by_phone_number", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first()

  }
})


export const getUserConnectedToolkits = query({
  args: { userId: v.id("users"), secret: v.string() },
  handler: async (ctx, args) => {

    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope")
    }

    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .collect();

    return connections.map((c) => c.toolkitSlug).filter((s): s is string => typeof s === "string");
  }
})

export const listRecentMessages = query({
  args: {
    threadId: v.id("thread"),
    limit: v.number(),
    secret: v.string(),
    excludeTools: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    // Fetch all messages in thread (filtered), then perform smart selection:
    // - last k (k = args.limit)
    // - plus full-text matches around latest user text (±1 neighbor)
    const byThread = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const excludeTools = args.excludeTools ?? true;
    const filtered = excludeTools ? byThread.filter((m) => !m.tool) : byThread;

    // Sort ascending by creation time to make neighbor selection easier
    const asc = filtered.slice().sort((a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0));

    // Last-k selection (use provided limit as k)
    const k = Math.max(0, args.limit);
    const lastK = k > 0 ? asc.slice(Math.max(0, asc.length - k)) : [];

    // Determine search term from latest available text in this thread
    const latestWithText = [...asc].reverse().find((d) => typeof (d as any).text === "string" && (d as any).text.length > 0);
    const searchTerm = (latestWithText as any)?.text as string | undefined;

    let aroundSelected: typeof asc = [];
    if (searchTerm && searchTerm.trim().length > 0) {
      // Full-text search within this thread
      const searchResults = await ctx.db
        .query("messages")
        .withSearchIndex("text_search", (q) => q.search("text", searchTerm).eq("threadId", args.threadId))
        .collect();

      const idToIndex = new Map(asc.map((m, i) => [m._id, i] as const));
      const neighborIndices = new Set<number>();
      for (const res of searchResults) {
        const idx = idToIndex.get(res._id);
        if (idx === undefined) continue;
        // pick 2 around: one before and one after
        for (const j of [idx - 1, idx, idx + 1]) {
          if (j >= 0 && j < asc.length) neighborIndices.add(j);
        }
      }
      aroundSelected = Array.from(neighborIndices)
        .sort((a, b) => a - b)
        .map((i) => asc[i]);
    }

    // Merge and dedupe by _id
    const mergedMap = new Map<string, (typeof asc)[number]>();
    for (const m of [...lastK, ...aroundSelected]) {
      mergedMap.set(String(m._id), m);
    }
    const mergedAsc = Array.from(mergedMap.values()).sort((a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0));

    // Return in descending order to preserve previous API behavior
    return mergedAsc.sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});
