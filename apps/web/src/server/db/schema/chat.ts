import { pgTable, text, timestamp, boolean, integer, index, varchar, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Conversations table - one per WhatsApp user
export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(), // Use UUID for conversation ID
  
  // User relationship - link to existing user table (required for WhatsApp users)
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  
  // WhatsApp-specific fields
  displayName: text("display_name"), // User's WhatsApp display name (if available)
  profilePicture: text("profile_picture"), // URL to profile picture (if available)
  
  // Conversation metadata
  isActive: boolean("is_active").default(true).notNull(),
  lastMessageAt: timestamp("last_message_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
  // Analytics/tracking
  messageCount: integer("message_count").notNull().default(0),
  
}, (table) => [
  index("conversation_last_message_idx").on(table.lastMessageAt),
  index("conversation_user_id_idx").on(table.userId),
  unique("conversation_user_unique").on(table.userId), // Ensure one conversation per user
]);

// Messages table - stores all messages in conversations
export const message = pgTable("message", {
  id: text("id").primaryKey(), // Use Twilio MessageSid or generate UUID
  
  // Conversation relationship
  conversationId: text("conversation_id").notNull().references(() => conversation.id, { onDelete: "cascade" }),
  
  // Message content
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).notNull().default("text"), // text, image, audio, video, document
  
  // Message direction and status
  direction: varchar("direction", { length: 10 }).notNull(), // "inbound" or "outbound"
  status: varchar("status", { length: 20 }).default("sent"), // sent, delivered, read, failed
  
  // Twilio-specific fields
  twilioSid: text("twilio_sid"), // Twilio MessageSid for tracking
  twilioStatus: text("twilio_status"), // Twilio delivery status
  
  // Media attachments (for future use)
  mediaUrl: text("media_url"), // URL to media file if message contains media
  mediaType: text("media_type"), // mime type of media
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
  // Error handling
  errorMessage: text("error_message"), // Store any processing errors
  
}, (table) => [
  index("message_conversation_idx").on(table.conversationId),
  index("message_created_at_idx").on(table.createdAt),
  index("message_direction_idx").on(table.direction),
  index("message_twilio_sid_idx").on(table.twilioSid),
]);

// Export types for use in tRPC routers
export type Conversation = typeof conversation.$inferSelect;
export type NewConversation = typeof conversation.$inferInsert;
export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
