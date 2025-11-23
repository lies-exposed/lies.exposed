import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  deleteChatConversation,
  getChatConversation,
  listChatConversations,
  sendChatMessage,
} from "#flows/chat/chat.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeSendChatMessageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminRead.literals[0]])(ctx))(
    Endpoints.Chat.Create,
    ({ body }) => {
      return pipe(
        sendChatMessage(body)(ctx),
        TE.mapLeft(ServerError.fromUnknown),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};

export const MakeListChatConversationsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Chat.List, ({ query }) => {
    return pipe(
      listChatConversations(query)(ctx),
      TE.mapLeft(ServerError.fromUnknown),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};

export const MakeGetChatConversationRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Chat.Get, ({ params: { id } }) => {
    return pipe(
      getChatConversation(id)(ctx),
      TE.mapLeft(ServerError.fromUnknown),
      TE.map((messages) => ({
        body: {
          data: {
            id,
            messages,
            created_at: messages[0]?.timestamp ?? new Date().toISOString(),
            updated_at:
              messages[messages.length - 1]?.timestamp ??
              new Date().toISOString(),
          },
        },
        statusCode: 200,
      })),
    );
  });
};

export const MakeDeleteChatConversationRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Chat.Delete, ({ params: { id } }) => {
    return pipe(
      deleteChatConversation(id)(ctx),
      TE.mapLeft(ServerError.fromUnknown),
      TE.map((deleted) => ({
        body: {
          data: deleted,
        },
        statusCode: 200,
      })),
    );
  });
};
