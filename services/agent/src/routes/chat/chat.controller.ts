import { Readable } from "node:stream";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { AGENT_CONFIGS } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type AgentInfo,
  type AIProvider,
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
import { compactConversation } from "#flows/chat/compact.flow.js";
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
 * Static fallback metadata — descriptions and default models per provider.
 * Dynamic model lists are fetched from provider APIs at runtime.
 */
const PROVIDER_MODELS: Record<
  AIProvider,
  { description: string; models: string[]; defaultModel: string }
> = {
  openai: {
    description: "OpenAI GPT models (or LocalAI-compatible)",
    models: ["gpt-4o", "gemma-4-e4b-it", "gemma-4-e2b-it"],
    defaultModel: "gemma-4-e4b-it",
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

async function fetchOpenAIModels(
  baseURL: string | undefined,
  apiKey: string,
): Promise<string[]> {
  const url = `${baseURL ?? "https://api.openai.com/v1"}/models`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id).sort();
}

async function fetchAnthropicModels(apiKey: string): Promise<string[]> {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id);
}

async function fetchXAIModels(apiKey: string): Promise<string[]> {
  const response = await fetch("https://api.x.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id);
}

export const MakeListProvidersRoute: Route = (r, ctx) => {
  AddEndpoint(r)(AgentEndpoints.Chat.Custom.ListProviders, () => {
    return pipe(
      TE.tryCatch(async () => {
        const providers: ProviderInfo[] = await Promise.all(
          (Object.keys(PROVIDER_MODELS) as AIProvider[]).map(async (name) => {
            const meta = PROVIDER_MODELS[name];
            const hasApiKey = checkProviderApiKey(name, ctx.env);
            let models: string[] = meta.models;

            if (hasApiKey) {
              try {
                switch (name) {
                  case "openai":
                    models = await fetchOpenAIModels(
                      ctx.env.OPENAI_BASE_URL,
                      ctx.env.OPENAI_API_KEY!,
                    );
                    break;
                  case "anthropic":
                    models = await fetchAnthropicModels(
                      ctx.env.ANTHROPIC_API_KEY!,
                    );
                    break;
                  case "xai":
                    models = await fetchXAIModels(ctx.env.XAI_API_KEY!);
                    break;
                }
              } catch (err) {
                ctx.logger.warn.log(
                  "Failed to fetch dynamic models for %s, using static list: %O",
                  name,
                  err,
                );
              }
            }

            return {
              name,
              description: meta.description,
              available: hasApiKey,
              models,
              defaultModel: meta.defaultModel,
            };
          }),
        );
        return providers;
      }, ServerError.fromUnknown),
      TE.map((providers) => ({
        body: {
          data: {
            providers,
            count: providers.length,
            timestamp: new Date().toISOString(),
          },
        },
        statusCode: 200 as const,
      })),
    );
  });
};

export const MakeListAgentsRoute: Route = (r, _ctx) => {
  AddEndpoint(r)(AgentEndpoints.Chat.Custom.ListAgents, () => {
    const agents: AgentInfo[] = (
      Object.entries(AGENT_CONFIGS) as [
        keyof typeof AGENT_CONFIGS,
        (typeof AGENT_CONFIGS)[keyof typeof AGENT_CONFIGS],
      ][]
    ).map(([name, cfg]) => ({
      name,
      label: cfg.label,
      description: cfg.description,
    }));

    return TE.right({
      body: {
        data: {
          agents,
          count: agents.length,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: 200 as const,
    });
  });
};

export const MakeCompactConversationRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminRead.literals[0]])(ctx))(
    AgentEndpoints.Chat.Custom.Compact,
    ({ body }) => {
      return pipe(
        compactConversation(body.conversation_id)(ctx),
        TE.mapLeft(ServerError.fromUnknown),
        TE.map(({ newConversationId, summary }) => ({
          body: {
            data: {
              new_conversation_id: newConversationId,
              summary,
            },
          },
          statusCode: 200 as const,
        })),
      );
    },
  );
};

/**
 * Check if a provider has the required API key configured
 */
function checkProviderApiKey(
  provider: AIProvider,
  env: Record<string, string | number | boolean | null | undefined>,
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
