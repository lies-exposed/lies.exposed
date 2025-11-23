import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { Schema } from "effect";
import type { Request, Response } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  deleteChatConversation,
  getChatConversation,
  listChatConversations,
  sendChatMessage,
  sendChatMessageStream,
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

/**
 * Streaming chat message route
 * Returns Server-Sent Events (SSE) stream with tool calls and responses
 */
export const MakeSendChatMessageStreamRoute: Route = (r, ctx) => {
  r.post(
    "/chat/message/stream",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    async (req: Request, res: Response) => {
      try {
        // Validate request body
        const parseResult = Schema.decodeUnknownEither(
          Endpoints.Chat.Custom.Stream.Input.Body,
        )(req.body);

        if (parseResult._tag === "Left") {
          ctx.logger.error.log("Invalid request body: %O", parseResult.left);
          res.status(400).json({
            error: "Invalid request",
            message: "Request body validation failed",
          });
          return;
        }

        const body = parseResult.right;

        // Set headers for Server-Sent Events
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

        // Send initial comment to establish connection
        res.write(": connected\n\n");

        ctx.logger.info.log(
          "Starting streaming chat for message: %s",
          body.message.substring(0, 50),
        );

        // Create and consume the async generator
        const streamGenerator = sendChatMessageStream(body)(ctx);

        for await (const event of streamGenerator) {
          // Format as SSE: data: {json}\n\n
          const eventData = JSON.stringify(event);
          res.write(`data: ${eventData}\n\n`);

          ctx.logger.debug.log("Sent stream event: %s", event.type);
        }

        // Send completion marker
        res.write("data: [DONE]\n\n");
        res.end();

        ctx.logger.info.log("Streaming chat completed successfully");
      } catch (error) {
        ctx.logger.error.log("Streaming error: %O", error);

        // Send error event if headers haven't been sent yet
        if (!res.headersSent) {
          res.status(500).json({
            error: "Streaming failed",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        } else {
          // Send error as SSE event
          const errorEvent = {
            type: "error",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error",
          };
          res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
          res.end();
        }
      }
    },
  );
};
