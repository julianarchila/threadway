import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { vMessage, vMessageStatus } from "./validators";

export default defineSchema({
  users: defineTable({
    phoneNumber: v.string(),
    name: v.optional(v.string()),
  }).index("by_phone_number", ["phoneNumber"]),

  workflows: defineTable({
    content: v.string(),
    title: v.string(),
    userId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updatedAt", ["userId", "updatedAt"]),

  connections: defineTable({
    userId: v.id("users"),
    authConfigId: v.string(),
    toolkitSlug: v.optional(v.string()),
    connectionId: v.string(),
    status: v.union(
      v.literal("INITIATED"),
      v.literal("ACTIVE")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_connectionId", ["connectionId"])
    .index("by_authConfigId", ["authConfigId"])
    .index("by_authConfigId_and_user", ["authConfigId", "userId"]),

  workflowIntegrations: defineTable({
    workflowId: v.id("workflows"),
    connectionId: v.id("connections"),
  })
    .index("by_workflow", ["workflowId"])
    .index("by_connection", ["connectionId"]),



  // agent stuff
  thread: defineTable({
    userId: v.id("users"),
  })
    .index("by_user", ["userId"]),

  messages: defineTable({
    threadId: v.id("thread"),
    userId: v.id("users"),
    error: v.optional(v.string()),

    status: vMessageStatus,

    message: v.optional(vMessage),

    tool: v.boolean(),
    text: v.optional(v.string()),

  })
    .index("by_thread", ["threadId"])
    .searchIndex("text_search", {
      searchField: "text",
      filterFields: ["userId", "threadId"],
    })




});
