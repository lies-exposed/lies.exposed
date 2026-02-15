import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { GetAgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import { GetLangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetBraveProvider } from "@liexp/backend/lib/providers/brave.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import axios from "axios";
import { BraveSearch } from "brave-search";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { type AgentContext } from "./context.type.js";
import { ENV } from "#io/ENV.js";

export const makeAgentContext = (
  namespace: string,
): TE.TaskEither<Error, AgentContext> => {
  return pipe(
    loadAndParseENV(ENVParser(Schema.decodeUnknownEither(ENV)))(process.cwd()),
    TE.fromEither,
    TE.chain((env) => {
      const agentLogger = logger.GetLogger(namespace);
      agentLogger.debug.log("Environment loaded:", env.LOCALAI_BASE_URL);
      agentLogger.debug.log("API_BASE_URL:", env.API_BASE_URL);

      const http = HTTPProvider(axios.create({}));

      agentLogger.debug.log("Initializing JWT provider...");
      // Initialize JWT provider for M2M authentication
      const jwt = GetJWTProvider({
        secret: env.JWT_SECRET,
        logger: agentLogger,
      });

      // Initialize Langchain provider for LocalAI
      const langchain = GetLangchainProvider({
        baseURL: env.LOCALAI_BASE_URL,
        apiKey: env.LOCALAI_API_KEY,
        maxRetries: env.LOCALAI_MAX_RETRIES,
        provider: env.AI_PROVIDER,
        models: {
          chat: env.LOCALAI_MODEL,
          embeddings: env.LOCALAI_MODEL,
        },
        options: {
          chat: {},
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

      agentLogger.debug.log("Initializing Agent provider...");

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
                    new Promise<void>((resolve) =>
                      setTimeout(resolve, delayMs),
                    ),
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

      // Initialize real MCP client to connect to API service
      const createMcpClient = (): MultiServerMCPClient => {
        const mcpBaseUrl = env.API_BASE_URL ?? "http://api.liexp.dev/mcp";
        agentLogger.debug.log("Connecting to MCP at:", mcpBaseUrl);
        agentLogger.debug.log(
          "Using API token:",
          env.API_TOKEN ? "***provided***" : "MISSING",
        );

        return new MultiServerMCPClient({
          api: {
            transport: "http",
            url: mcpBaseUrl,
            headers: {
              Authorization: `Bearer ${env.API_TOKEN}`,
            },
            // Enable automatic reconnection when API restarts or session expires.
            // This handles runtime disconnections (e.g., API restarts, session expiry).
            // For initial startup failures, the retryConnect function below provides
            // exponential backoff with more attempts.
            reconnect: {
              enabled: true,
              maxAttempts: 5,
              delayMs: 10_000,
            },
          },
        });
      };

      return pipe(
        TE.right(createMcpClient()),
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
        TE.chain((mcpClient) =>
          GetAgentProvider({ mcpClient })({
            langchain,
            logger: agentLogger,
            puppeteer: puppeteerProvider,
            brave: braveProvider,
          }),
        ),
        TE.map((agentProvider) => {
          agentLogger.info.log("Agent provider initialized successfully");
          return {
            env,
            logger: agentLogger,
            jwt,
            http,
            langchain,
            puppeteer: puppeteerProvider,
            brave: braveProvider,
            agent: agentProvider,
          };
        }),
      );
    }),
  );
};
