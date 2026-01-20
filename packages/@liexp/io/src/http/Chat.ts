import { Schema } from "effect";

// Chat message types
export const ChatRole = Schema.Literal(
  "user",
  "assistant",
  "system",
  "tool",
).annotations({
  title: "ChatRole",
  description: "Role of the message sender",
});

export type ChatRole = typeof ChatRole.Type;

// Tool call structure (for assistant messages that call tools)
export const ToolCall = Schema.Struct({
  id: Schema.String,
  type: Schema.Literal("function"),
  function: Schema.Struct({
    name: Schema.String,
    arguments: Schema.String, // JSON stringified arguments
  }),
}).annotations({
  title: "ToolCall",
  description: "A tool call made by the assistant",
});

export type ToolCall = typeof ToolCall.Type;

// Tool response structure (for tool messages responding to tool calls)
export const ToolResponse = Schema.Struct({
  tool_call_id: Schema.String,
  content: Schema.String, // Can be JSON stringified structured data
}).annotations({
  title: "ToolResponse",
  description: "Response from a tool execution",
});

export type ToolResponse = typeof ToolResponse.Type;

export const ChatMessage = Schema.Struct({
  id: Schema.String,
  role: ChatRole,
  content: Schema.String,
  timestamp: Schema.String, // ISO date string
  // Optional fields for structured responses (mimicking LangChain's AIMessage)
  tool_calls: Schema.optional(Schema.Array(ToolCall)),
  tool_call_id: Schema.optional(Schema.String), // For tool response messages
  // Structured response data when using function calling / structured output
  structured_output: Schema.optional(Schema.Unknown),
  // Additional metadata
  response_metadata: Schema.optional(
    Schema.Struct({
      model: Schema.optional(Schema.String),
      finish_reason: Schema.optional(Schema.String),
      usage: Schema.optional(
        Schema.Struct({
          prompt_tokens: Schema.optional(Schema.Number),
          completion_tokens: Schema.optional(Schema.Number),
          total_tokens: Schema.optional(Schema.Number),
        }),
      ),
    }),
  ),
}).annotations({
  title: "ChatMessage",
  description: "A single chat message with optional structured output support",
});

export type ChatMessage = typeof ChatMessage.Type;

// Resource context for react-admin integration
export const ResourceContext = Schema.Struct({
  resource: Schema.String, // e.g., "actors", "events", "links"
  recordId: Schema.NullOr(Schema.String), // ID of the current record being edited
  action: Schema.optional(Schema.String), // e.g., "edit", "create", "list", "show"
}).annotations({
  title: "ResourceContext",
  description: "React-admin resource context for context-aware assistance",
});

export type ResourceContext = typeof ResourceContext.Type;

// Chat request/response types
export const ChatRequest = Schema.Struct({
  message: Schema.String,
  conversation_id: Schema.NullOr(Schema.String),
  model: Schema.optional(Schema.String),
  resource_context: Schema.optional(ResourceContext),
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

// Streaming event types for Server-Sent Events
export const StreamEventType = Schema.Literal(
  "content_delta", // Incremental content from assistant
  "tool_call_start", // Tool invocation started
  "tool_call_end", // Tool invocation completed
  "message_start", // New message starting
  "message_end", // Message completed
  "error", // Error occurred
).annotations({
  title: "StreamEventType",
  description: "Type of streaming event",
});

export type StreamEventType = typeof StreamEventType.Type;

// Streaming event payload
export const ChatStreamEvent = Schema.Struct({
  type: StreamEventType,
  timestamp: Schema.String,
  // Content delta for incremental text
  content: Schema.optional(Schema.String),
  // Tool call information
  tool_call: Schema.optional(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      arguments: Schema.optional(Schema.String), // JSON stringified
      result: Schema.optional(Schema.String), // JSON stringified result
    }),
  ),
  // Message metadata
  message_id: Schema.optional(Schema.String),
  role: Schema.optional(ChatRole),
  // Error information
  error: Schema.optional(Schema.String),
}).annotations({
  title: "ChatStreamEvent",
  description: "Server-sent event for chat streaming",
});

export type ChatStreamEvent = typeof ChatStreamEvent.Type;
