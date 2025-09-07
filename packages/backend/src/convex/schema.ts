import { ConnectionDataSchema } from "@composio/core";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Fields are optional
    phoneNumber: v.string(),
    name: v.optional(v.string()),
  }).index("by_phone_number", ["phoneNumber"]),
  // Tabla para guardar el contenido del editor
  workflows: defineTable({
    content: v.string(), // Contenido del editor Tiptap
    title: v.string(),
    userId: v.id("users"), // Referencia al ID del usuario en la tabla users
    updatedAt: v.number(), // Timestamp de última actualización
  })
    .index("by_user", ["userId"])
    .index("by_user_updatedAt", ["userId", "updatedAt"]),


  connections: defineTable({
    userId: v.id("users"),
    authConfigId: v.string(),
    tolkitSlug: v.optional(v.string()),
    connectionId: v.string(),
    status: v.union(
      v.literal("INITIALIZING"),
      v.literal("INITIATED"),
      v.literal("ACTIVE"),
      v.literal("FAILED"),
      v.literal("EXPIRED"),
      v.literal("INACTIVE")
    )
  }).index("by_user", ["userId"])
  .index("by_connectionId", ["connectionId"])
  .index("by_authConfigId", ["authConfigId"])
  .index("by_authConfigId_and_user", ["authConfigId", "userId"])


});
