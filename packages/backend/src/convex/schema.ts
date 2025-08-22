import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Fields are optional
    phoneNumber: v.string(),
    name: v.optional(v.string()),
  }).index("by_phone_number", ["phoneNumber"]),

  todos: defineTable({
    title: v.string(),
    done: v.boolean(),
  })
});
