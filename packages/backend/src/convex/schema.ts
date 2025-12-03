import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    phoneNumber: v.string(),
    name: v.optional(v.string()),
    // Kapso Platform integration
    kapsoCustomerId: v.optional(v.string()),
  }).index("by_phone_number", ["phoneNumber"])
    .index("by_kapso_customer_id", ["kapsoCustomerId"]),

  // Connected WhatsApp Numbers - Multiple numbers per user
  connectedNumbers: defineTable({
    userId: v.id("users"),
    phoneNumberId: v.string(), // WhatsApp Phone Number ID from Kapso
    phoneNumber: v.optional(v.string()), // Actual phone number (e.g., +1234567890)
    connectionType: v.union(
      v.literal("coexistence"),
      v.literal("dedicated")
    ),
    wabaId: v.optional(v.string()), // WhatsApp Business Account ID
    status: v.union(
      v.literal("active"),
      v.literal("disconnected"),
      v.literal("suspended")
    ),
    connectedAt: v.number(),
    disconnectedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_phone_number_id", ["phoneNumberId"])
    .index("by_user_and_status", ["userId", "status"]),

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

});