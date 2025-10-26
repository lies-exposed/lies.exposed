import { Schema } from "effect";

// Chat message types
export const ChatRole = Schema.Literal(
  "user",
  "assistant",
  "system",
).annotations({
  title: "ChatRole",
  description: "Role of the message sender",
});

export type ChatRole = typeof ChatRole.Type;

export const ChatMessage = Schema.Struct({
  id: Schema.String,
  role: ChatRole,
  content: Schema.String,
  timestamp: Schema.String, // ISO date string
}).annotations({
  title: "ChatMessage",
  description: "A single chat message",
});

export type ChatMessage = typeof ChatMessage.Type;

// Chat request/response types
export const ChatRequest = Schema.Struct({
  message: Schema.String,
  conversation_id: Schema.NullOr(Schema.String),
  model: Schema.optional(Schema.String),
}).annotations({
  title: "ChatRequest",
  description: "Request to send a chat message",
});

export type ChatRequest = typeof ChatRequest.Type;

export const ChatResponse = Schema.Struct({
  message: ChatMessage,
  conversationId: Schema.String,
}).annotations({
  title: "ChatResponse",
  description: "Response from chat service",
});

export type ChatResponse = typeof ChatResponse.Type;

// Chat conversation types
export const ChatConversation = Schema.Struct({
  id: Schema.String,
  messages: Schema.Array(ChatMessage),
  created_at: Schema.String,
  updated_at: Schema.String,
}).annotations({
  title: "ChatConversation",
  description: "A chat conversation with messages",
});

export type ChatConversation = typeof ChatConversation.Type;

export const ListChatConversationsQuery = Schema.partial(
  Schema.Struct({
    limit: Schema.Number,
    offset: Schema.Number,
  }),
).annotations({
  title: "ListChatConversationsQuery",
  description: "Query parameters for listing conversations",
});

export type ListChatConversationsQuery = typeof ListChatConversationsQuery.Type;
