import { Schema } from "effect";

// AI Provider types
export const AIProvider = Schema.Literal(
  "openai",
  "anthropic",
  "xai",
).annotations({
  title: "AIProvider",
  description: "Supported AI provider",
});

export type AIProvider = typeof AIProvider.Type;

// Available model names per provider
export const AvailableModels = Schema.Union(
  // OpenAI models
  Schema.Literal("gpt-4"),
  Schema.Literal("gpt-4o"),
  // Local AI models
  Schema.Literal("qwen3-4b"),
  Schema.Literal("qwen3-embedding-4b"),
  // XAI models
  Schema.Literal("grok-4-fast"),
  // Anthropic Claude models
  Schema.Literal("claude-sonnet-4-20250514"),
  Schema.Literal("claude-3-7-sonnet-latest"),
  Schema.Literal("claude-3-5-haiku-latest"),
).annotations({
  title: "AvailableModels",
  description: "Available model identifiers",
});

export type AvailableModels = typeof AvailableModels.Type;

// AI Configuration override for per-request provider selection
export const AIConfig = Schema.Struct({
  provider: AIProvider,
  model: Schema.optional(AvailableModels),
  options: Schema.optional(
    Schema.Struct({
      temperature: Schema.optional(Schema.Number),
      maxTokens: Schema.optional(Schema.Number),
      topP: Schema.optional(Schema.Number),
      frequencyPenalty: Schema.optional(Schema.Number),
    }),
  ),
}).annotations({
  title: "AIConfig",
  description: "AI provider configuration override for per-request customization",
});

export type AIConfig = typeof AIConfig.Type;

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
  // AI provider configuration override
  aiConfig: Schema.optional(AIConfig),
}).annotations({
  title: "ChatRequest",
  description: "Request to send a chat message with optional AI provider configuration",
});

export type ChatRequest = typeof ChatRequest.Type;

export const ChatResponse = Schema.Struct({
  message: ChatMessage,
  conversationId: Schema.String,
  // Provider information about which provider was used
  usedProvider: Schema.optional(
    Schema.Struct({
      provider: AIProvider,
      model: AvailableModels,
    }),
  ),
}).annotations({
  title: "ChatResponse",
  description: "Response from chat service with provider information",
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
  // Token usage information (provided at message_end or estimated during streaming)
  usage: Schema.optional(
    Schema.Struct({
      prompt_tokens: Schema.optional(Schema.Number),
      completion_tokens: Schema.optional(Schema.Number),
      total_tokens: Schema.optional(Schema.Number),
    }),
  ),
  // Thinking/debug content from LLM (e.g., OpenAI extended thinking)
  thinking: Schema.optional(Schema.Boolean),
  // Provider information (sent at stream start)
  usedProvider: Schema.optional(
    Schema.Struct({
      provider: AIProvider,
      model: AvailableModels,
    }),
  ),
}).annotations({
  title: "ChatStreamEvent",
  description: "Server-sent event for chat streaming",
});

export type ChatStreamEvent = typeof ChatStreamEvent.Type;
