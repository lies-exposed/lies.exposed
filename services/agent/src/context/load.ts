import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { GetAgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import { GetLangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import axios from "axios";
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

      agentLogger.debug.log("Initializing Agent provider...");
      // Initialize real MCP client to connect to API service
      return pipe(
        TE.tryCatch(
          async () => {
            const mcpBaseUrl = env.API_BASE_URL ?? "http://api.liexp.dev/mcp";
            agentLogger.debug.log("Connecting to MCP at:", mcpBaseUrl);
            agentLogger.debug.log(
              "Using API token:",
              env.API_TOKEN ? "***provided***" : "MISSING",
            );

            const mcpClient = new MultiServerMCPClient({
              api: {
                transport: "http",
                url: mcpBaseUrl,
                headers: {
                  Authorization: `Bearer ${env.API_TOKEN}`,
                },
              },
            });

            await mcpClient.initializeConnections();

            // Wrap the client to make it compatible
            return Promise.resolve(mcpClient);
          },
          (error) => {
            agentLogger.error.log("Failed to initialize MCP client:", error);
            return ServerError.fromUnknown({
              details: `MCP client initialization failed: ${error}`,
              status: 500,
              stack: error instanceof Error ? error.stack : undefined,
            });
          },
        ),
        TE.chain((mcpClient) =>
          GetAgentProvider({ mcpClient })({
            langchain,
            logger: agentLogger,
            puppeteer: puppeteerProvider,
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
            agent: agentProvider,
          };
        }),
      );
    }),
  );
};
