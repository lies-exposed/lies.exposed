import * as fs from "fs";
import path from "path";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { GetAgentFactory } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { GetLangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetBraveProvider } from "@liexp/backend/lib/providers/brave.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { type AvailableModels } from "@liexp/io/lib/http/Chat.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import axios from "axios";
import { BraveSearch } from "brave-search";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { createMcpClient } from "../mcp/mcp.client.js";
import { type AgentContext } from "./context.type.js";
import { ENV } from "#io/ENV.js";
import { createCliExecutorTool } from "#tools/cli-executor.tool.js";

const agentLogger = logger.GetLogger("agent");

const getAvailableProviders = (env: ENV) => {
  // Determine which providers are available based on API keys
  const availableProviders = {
    openai: !!env.OPENAI_API_KEY,
    anthropic: !!env.ANTHROPIC_API_KEY,
    xai: !!env.XAI_API_KEY,
  };
  return availableProviders;
};
// Get the first available provider, or throw error if none are configured
const getDefaultProvider = (env: ENV): "openai" | "anthropic" | "xai" => {
  const availableProviders = getAvailableProviders(env);

  if (availableProviders.openai) return "openai";
  if (availableProviders.xai) return "xai";
  if (availableProviders.anthropic) return "anthropic";
  throw new Error(
    "No AI provider API keys configured. Set at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY",
  );
};

// Initialize Langchain provider with the default available provider
// Provider can be overridden per-message via aiConfig in chat flow
export const getLangchainConfig = (env: ENV) => {
  const provider = getDefaultProvider(env);
  agentLogger.debug.log(
    `Initializing Langchain with default provider: ${provider}`,
  );

  switch (provider) {
    case "openai": {
      const model = (env.LOCALAI_MODEL ?? "gpt-4o") as AvailableModels;
      return {
        baseURL: env.OPENAI_BASE_URL!,
        apiKey: env.OPENAI_API_KEY!,
        maxRetries: env.LOCALAI_MAX_RETRIES,
        provider: "openai" as const,
        models: {
          chat: model,
          embeddings: model,
        },
      };
    }
    case "anthropic":
      return {
        baseURL: undefined as any,
        apiKey: env.ANTHROPIC_API_KEY!,
        maxRetries: env.LOCALAI_MAX_RETRIES,
        provider: "anthropic" as const,
        models: {
          chat: "claude-sonnet-4-20250514" as const,
          embeddings: "claude-sonnet-4-20250514" as const,
        },
      };
    case "xai":
      return {
        baseURL: "https://api.x.ai/v1",
        apiKey: env.XAI_API_KEY!,
        maxRetries: env.LOCALAI_MAX_RETRIES,
        provider: "xai" as const,
        models: {
          chat: "grok-4-fast" as const,
          embeddings: "grok-4-fast" as const,
        },
      };
    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
    }
  }
};

export const getAgentContext =
  (agentLogger: logger.Logger) =>
  (env: ENV): TE.TaskEither<Error, AgentContext> => {
    agentLogger.debug.log("Environment loaded");
    agentLogger.debug.log("API_BASE_URL:", env.API_BASE_URL);

    const http = HTTPProvider(axios.create({}));

    agentLogger.debug.log("Initializing JWT provider...");
    // Initialize JWT provider for M2M authentication
    const jwt = GetJWTProvider({
      secret: env.JWT_SECRET,
      logger: agentLogger,
    });

    const langchainConfig = getLangchainConfig(env);
    const langchain = GetLangchainProvider({
      baseURL: langchainConfig.baseURL,
      apiKey: langchainConfig.apiKey,
      maxRetries: langchainConfig.maxRetries,
      provider: langchainConfig.provider,
      models: langchainConfig.models,
      options: {
        // Disable token streaming for the chat model. Reasoning models served
        // via LocalAI (e.g. qwen3.6-35b-a3b) stream their leading <think> tokens
        // as roleless `reasoning` deltas. @langchain/openai parses a delta with
        // no `role` as a generic ChatMessageChunk; once the accumulator is a
        // ChatMessageChunk, concatenating the later assistant AIMessageChunks
        // silently drops their `tool_call_chunks`, so the React agent sees no
        // tool call, routes straight to END, and returns "No response generated".
        // The non-streaming response is a standard assistant message with intact
        // role + tool_calls, which langchain parses correctly. We can't disable
        // thinking on qwen3.6 when tools are present, so this is the robust fix.
        chat: {
          streaming: false,
        },
        embeddings: {},
      },
    });

    agentLogger.debug.log("Initializing Puppeteer provider...");
    // Initialize Puppeteer provider
    const puppeteerProvider = GetPuppeteerProvider(
      puppeteer as any as VanillaPuppeteer,
      {},
      puppeteer.KnownDevices,
    );

    const braveSearch = new BraveSearch(env.BRAVE_API_KEY);
    const braveProvider = GetBraveProvider(braveSearch);

    agentLogger.debug.log("Initializing Agent provider and factory...");

    /**
     * Exponential backoff function: starts at baseDelayMs and doubles with each retry
     * to a maximum of maxDelayMs
     */
    const exponentialBackoff = (
      baseDelayMs: number,
      maxDelayMs: number,
      attemptNumber: number,
    ): number =>
      Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attemptNumber - 1));

    /**
     * Retry MCP connection using fp-ts TaskEither pattern with exponential backoff.
     * Retries only the initializeConnections() call, keeping the client instance alive.
     * The MultiServerMCPClient handles runtime reconnections separately (maxAttempts: 5,
     * delayMs: 10s). This retryConnect handles initial startup failures.
     */
    const retryConnect = (
      mcpClient: MultiServerMCPClient,
      attempt = 1,
      maxAttempts = 10,
      baseDelayMs = 1000,
      maxDelayMs = 20_000,
    ): TE.TaskEither<Error, void> =>
      pipe(
        TE.tryCatch(
          () => mcpClient.initializeConnections(),
          (error) =>
            error instanceof Error ? error : new Error(String(error)),
        ),
        TE.fold(
          (error) => {
            if (attempt >= maxAttempts) {
              agentLogger.error.log(
                `MCP connection failed after ${maxAttempts} attempts. Giving up.`,
              );
              return TE.left(error);
            }

            const delayMs = exponentialBackoff(
              baseDelayMs,
              maxDelayMs,
              attempt,
            );
            if (error instanceof Error) {
              agentLogger.warn.log(
                `MCP connection attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delayMs / 1000}s...`,
                { stack: error.stack },
              );
            } else {
              agentLogger.warn.log(
                `MCP connection attempt ${attempt}/${maxAttempts} failed. Retrying in ${delayMs / 1000}s...`,
                { error },
              );
            }

            return pipe(
              TE.tryCatch(
                () =>
                  new Promise<void>((resolve) => setTimeout(resolve, delayMs)),
                (e) => (e instanceof Error ? e : new Error(String(e))),
              ),
              TE.chain(() =>
                retryConnect(
                  mcpClient,
                  attempt + 1,
                  maxAttempts,
                  baseDelayMs,
                  maxDelayMs,
                ),
              ),
            );
          },
          () => TE.right(undefined),
        ),
      );

    return pipe(
      TE.right(createMcpClient(env)),
      TE.chain((mcpClient) =>
        pipe(
          retryConnect(mcpClient),
          TE.map(() => {
            agentLogger.info.log("MCP client connected successfully");
            return mcpClient;
          }),
          TE.mapLeft((error) => {
            agentLogger.error.log(
              "Failed to initialize MCP connections:",
              error,
            );
            return ServerError.fromUnknown({
              details: `MCP connection initialization failed: ${error}`,
              status: 500,
              stack: error instanceof Error ? error.stack : undefined,
            });
          }),
        ),
      ),
      TE.map((mcpClient) => {
        agentLogger.info.log("MCP client ready, creating agent factory");

        const fsClient = GetFSClient({ client: fs });

        // Single source for agents: the factory creates and caches agents
        // on-demand per type + provider config (default "auto" included).
        const agentFactory = GetAgentFactory({
          mcpClient,
          cliTool: createCliExecutorTool(
            path.resolve(process.cwd(), "build/cli/cli.js"),
          ),
          apiKeys: {
            openai: env.OPENAI_API_KEY,
            anthropic: env.ANTHROPIC_API_KEY,
            xai: env.XAI_API_KEY,
          },
        })({
          langchain,
          logger: agentLogger,
          puppeteer: puppeteerProvider,
          brave: braveProvider,
          fs: fsClient,
        });

        return {
          env,
          logger: agentLogger,
          jwt,
          http,
          langchain,
          puppeteer: puppeteerProvider,
          brave: braveProvider,
          fs: fsClient,
          agentFactory,
        };
      }),
    );
  };

export const loadAgentContext = (
  namespace: string,
): TE.TaskEither<Error, AgentContext> => {
  const agentLogger = logger.GetLogger(namespace);
  return pipe(
    loadAndParseENV(ENVParser(Schema.decodeUnknownEither(ENV)))(process.cwd()),
    TE.fromEither,
    TE.chain(getAgentContext(agentLogger)),
  );
};
