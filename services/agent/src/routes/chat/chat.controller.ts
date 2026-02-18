import { Readable } from "node:stream";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type AIProvider,
  type AvailableModels,
  type ProviderInfo,
} from "@liexp/io/lib/http/Chat.js";
import { AdminRead } from "@liexp/io/lib/http/auth/permissions/index.js";
import { AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { type HTTPStreamResponse } from "@ts-endpoint/express/lib/HTTPResponse.js";
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
    AgentEndpoints.Chat.Create,
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
  AddEndpoint(r)(AgentEndpoints.Chat.List, ({ query }) => {
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
  AddEndpoint(r)(AgentEndpoints.Chat.Get, ({ params: { id } }) => {
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
  AddEndpoint(r)(AgentEndpoints.Chat.Delete, ({ params: { id } }) => {
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

export const MakeSendChatMessageStreamRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminRead.literals[0]])(ctx))(
    AgentEndpoints.Chat.Custom.Stream,
    ({ body }) => {
      return TE.tryCatch(() => {
        ctx.logger.info.log(
          "Starting streaming chat for message: %s",
          body.message.substring(0, 50),
        );

        const streamGenerator = sendChatMessageStream(body)(ctx);

        // Convert async generator to ReadableStream with SSE formatting
        const stream = Readable.from(
          (async function* () {
            try {
              // Send initial comment to establish connection
              yield ": connected\n\n";

              for await (const event of streamGenerator) {
                ctx.logger.debug.log("Sent stream event: %s", event.type);
                // Format as SSE: data: {json}\n\n
                const eventData = JSON.stringify(event);
                yield `data: ${eventData}\n\n`;
              }

              // Send completion marker
              yield "data: [DONE]\n\n";
              ctx.logger.info.log("Streaming chat completed successfully");
            } catch (error) {
              ctx.logger.error.log("Streaming error: %O", error);
              // Send error as SSE event
              const errorEvent = {
                type: "error",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
              };
              yield `data: ${JSON.stringify(errorEvent)}\n\n`;
            }
          })(),
          { encoding: "utf8" },
        );

        return Promise.resolve({
          statusCode: 200,
          stream,
          headers: {
            "Content-Type": "text/event-stream",
          },
        } satisfies HTTPStreamResponse);
      }, ServerError.fromUnknown);
    },
  );
};

/**
 * Provider-to-models mapping — single source of truth for provider discovery.
 * The agent knows which providers exist and what models they support.
 */
const PROVIDER_MODELS: Record<
  AIProvider,
  {
    description: string;
    models: AvailableModels[];
    defaultModel: AvailableModels;
  }
> = {
  openai: {
    description: "OpenAI GPT models (or LocalAI-compatible)",
    models: ["gpt-4o", "qwen3-4b"],
    defaultModel: "gpt-4o",
  },
  anthropic: {
    description: "Anthropic Claude models",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-7-sonnet-latest",
      "claude-3-5-haiku-latest",
    ],
    defaultModel: "claude-sonnet-4-20250514",
  },
  xai: {
    description: "X.AI Grok models",
    models: ["grok-4-fast"],
    defaultModel: "grok-4-fast",
  },
};

export const MakeListProvidersRoute: Route = (r, ctx) => {
  AddEndpoint(r)(AgentEndpoints.Chat.Custom.ListProviders, () => {
    const providers: ProviderInfo[] = (
      Object.keys(PROVIDER_MODELS) as AIProvider[]
    ).map((name) => {
      const meta = PROVIDER_MODELS[name];
      // Check if provider has API key configured
      const hasApiKey = checkProviderApiKey(name, ctx.env);
      return {
        name,
        description: meta.description,
        available: hasApiKey,
        models: meta.models,
        // Use the provider's default model
        defaultModel: meta.defaultModel,
      };
    });

    return TE.right({
      body: {
        data: {
          providers,
          count: providers.length,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: 200 as const,
    });
  });
};

/**
 * Check if a provider has the required API key configured
 */
function checkProviderApiKey(
  provider: AIProvider,
  env: Record<string, string | number | boolean | undefined>,
): boolean {
  switch (provider) {
    case "openai":
      return !!env.OPENAI_API_KEY;
    case "anthropic":
      return !!env.ANTHROPIC_API_KEY;
    case "xai":
      return !!env.XAI_API_KEY;
    default:
      return false;
  }
}
