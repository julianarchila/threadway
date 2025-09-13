import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

  // Authorized phone numbers table
  authorizedPhones: defineTable({
    // Owner user who authorizes the phone number
    ownerId: v.id("users"),

    // Authorized phone number
    phoneNumber: v.string(),
    phoneCountryCode: v.string(),

    // Optional name/alias for the number
    alias: v.optional(v.string()),

    // Authorization status
    status: v.union(
      v.literal("INVITED"),   // Invited but not registered
      v.literal("ACTIVE"),    // Active (may or may not be registered)
    ),

    // // User ID if already registered (can be null)
    // linkedUserId: v.optional(v.id("users")),

    // Access type: ALL = all workflows, SPECIFIC = specific workflows
    accessType: v.union(
      v.literal("ALL"),
      v.literal("SPECIFIC")
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_phone_number", ["phoneNumber"])
    .index("by_owner_and_status", ["ownerId", "status"])
    .index("by_phone_and_status", ["phoneNumber", "status"]),

});