import {
  ChatConversation,
  ChatRequest,
  ChatResponse,
  ChatStreamEvent,
  ProvidersResponse,
} from "@liexp/io/lib/http/Chat.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { Endpoint, ResourceEndpoints, StreamOutput } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleChatOutput = Output(ChatResponse).annotations({
  title: "ChatResponse",
});

const ListConversationsOutput = ListOutput(ChatConversation, "Conversations");

export const ListConversations = Endpoint({
  Method: "GET",
  getPath: () => "/chat/conversations",
  Input: {
    Query: Schema.Struct({
      limit: Schema.optional(Schema.NumberFromString),
      offset: Schema.optional(Schema.NumberFromString),
    }),
  },
  Output: ListConversationsOutput,
});

export const SendMessage = Endpoint({
  Method: "POST",
  getPath: () => "/chat/message",
  Input: {
    Body: ChatRequest,
  },
  Output: SingleChatOutput,
});

export const GetConversation = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/chat/conversations/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: Output(ChatConversation).annotations({
    title: "Conversation",
  }),
});

export const DeleteConversation = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/chat/conversations/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: Schema.Struct({
    data: Schema.Boolean,
  }).annotations({
    title: "DeleteResult",
  }),
});

// Note: Streaming endpoint is handled separately as Server-Sent Events
// It doesn't follow the standard endpoint pattern due to SSE streaming nature
export const SendMessageStream = Endpoint({
  Method: "POST",
  getPath: () => "/chat/message/stream",
  Input: {
    Body: ChatRequest,
  },
  // Output is a stream of ChatStreamEvent via Server-Sent Events
  Output: StreamOutput(ChatStreamEvent),
});

export const ListProviders = Endpoint({
  Method: "GET",
  getPath: () => "/providers",
  Input: {},
  Output: Output(ProvidersResponse).annotations({
    title: "ProvidersResponse",
  }),
});

export const chat = ResourceEndpoints({
  Get: GetConversation,
  List: ListConversations,
  Create: SendMessage,
  Edit: SendMessage, // reuse for editing
  Delete: DeleteConversation,
  Custom: {
    Stream: SendMessageStream,
    ListProviders,
  },
});
