import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import {
  ChatConversation,
  ChatRequest,
  ChatResponse,
} from "../../io/http/Chat.js";
import { ListOutput, Output } from "../../io/http/Common/Output.js";

const SingleChatOutput = Output(ChatResponse).annotations({
  title: "ChatResponse",
});

const ListConversationsOutput = ListOutput(ChatConversation, "Conversations");

export const SendMessage = Endpoint({
  Method: "POST",
  getPath: () => "/chat/message",
  Input: {
    Body: ChatRequest,
  },
  Output: SingleChatOutput,
});

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

export const chat = ResourceEndpoints({
  Get: GetConversation,
  List: ListConversations,
  Create: SendMessage,
  Edit: SendMessage, // reuse for editing
  Delete: DeleteConversation,
  Custom: {},
});
