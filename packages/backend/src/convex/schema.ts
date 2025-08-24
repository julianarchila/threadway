import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Fields are optional
    phoneNumber: v.string(),
    name: v.optional(v.string()),
  }).index("by_phone_number", ["phoneNumber"]),

  integrations: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nameLower: v.string(),
    mcpUrl: v.string(),
    apiKey: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_nameLower", ["userId", "nameLower"]),
});
