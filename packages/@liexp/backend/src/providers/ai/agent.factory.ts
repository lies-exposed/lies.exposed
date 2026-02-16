/**
 * Agent Factory: Creates agents on-demand with custom provider configurations
 *
 * This module provides functionality to create agents dynamically without requiring
 * server restart when switching between AI providers (OpenAI, Anthropic, XAI).
 */

import { readFileSync } from "fs";
import path from "path";
import { type StructuredToolInterface } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { AIConfig } from "@liexp/io/lib/http/Chat.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { createAgent as createReactAgent, type ReactAgent } from "langchain";
import { type BraveProviderContext } from "../../context/brave.context.js";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { ServerError } from "../../errors/index.js";
import {
  GetLangchainProvider,
  type AIProvider,
  type AvailableModels,
} from "./langchain.provider.js";
import { createSearchWebTool } from "./tools/searchWeb.tools.js";
import { createWebScrapingTool } from "./tools/webScraping.tools.js";

export type Agent = ReactAgent;

/**
 * Configuration override for creating an agent with custom provider settings
 */
export interface ProviderConfigOverride {
  provider?: AIProvider;
  model?: AvailableModels;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
  };
}

/**
 * Merged provider configuration combining defaults with overrides
 */
interface MergedProviderConfig {
  provider: AIProvider;
  model: AvailableModels;
  options?: Record<string, unknown>;
}

/**
 * Merge request-level provider config with defaults
 * @param defaultOptions Default LangchainProvider options
 * @param override Request-level override configuration
 * @returns Merged configuration
 */
export const mergeProviderConfig = (
  defaultOptions: LangchainContext["langchain"]["options"],
  override?: ProviderConfigOverride,
): MergedProviderConfig => {
  const chatOptions = defaultOptions.options?.chat as
    | Record<string, unknown>
    | undefined;

  if (!override) {
    return {
      provider: defaultOptions.provider,
      model: defaultOptions.models?.chat ?? "gpt-4o",
      options: chatOptions,
    };
  }

  return {
    provider: override.provider ?? defaultOptions.provider,
    model: override.model ?? defaultOptions.models?.chat ?? "gpt-4o",
    options: override.options
      ? { ...chatOptions, ...override.options }
      : chatOptions,
  };
};

/**
 * Helper to convert AIConfig to ProviderConfigOverride
 */
export const aiConfigToProviderOverride = (
  config: AIConfig,
): ProviderConfigOverride => {
  return {
    provider: config.provider,
    model: config.model,
    options: config.options,
  };
};

const toAgentError = (e: unknown) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(e, null, 2));
  return ServerError.fromUnknown(e);
};

interface AgentFactoryOptions {
  mcpClient: MultiServerMCPClient | null;
}

/**
 * Create an agent with a specific Langchain provider
 * Used internally by the factory to construct agents
 */
const createAgentWithProvider = (
  chat: LangchainContext["langchain"]["chat"],
  tools: StructuredToolInterface[],
  logger: LoggerContext["logger"],
): Agent => {
  const agentCheckpointer = new MemorySaver();

  const agent = createReactAgent({
    model: chat,
    tools,
    checkpointer: agentCheckpointer,
    systemPrompt: readFileSync(
      path.resolve(process.cwd(), "AGENTS.md"),
      "utf-8",
    ),
    description: "A React agent for handling user queries",
  });

  logger.debug.log(
    `Agent created with chat model: %O`,
    (chat as unknown as { model?: string }).model ?? "unknown",
  );

  return agent;
};

/**
 * Agent Factory: Creates agents on-demand with optional provider overrides
 *
 * Caches MCP tools to avoid re-fetching on every agent creation.
 */
export const GetAgentFactory =
  (opts: AgentFactoryOptions) =>
  <
    C extends LangchainContext &
      LoggerContext &
      PuppeteerProviderContext &
      BraveProviderContext,
  >(
    ctx: C,
  ): ((
    override?: ProviderConfigOverride,
  ) => TaskEither<ServerError, Agent>) => {
    // Cache for tools (created on first use)
    let cachedTools: StructuredToolInterface[] | null = null;
    let initializeToolsTask: TaskEither<
      ServerError,
      StructuredToolInterface[]
    > | null = null;

    /**
     * Initialize tools once and cache them
     * Falls back to empty tools array if MCP client is not available
     */
    const getOrInitializeTools = (): TaskEither<
      ServerError,
      StructuredToolInterface[]
    > => {
      if (cachedTools) {
        return fp.TE.right(cachedTools);
      }

      if (initializeToolsTask) {
        return initializeToolsTask;
      }

      initializeToolsTask = fp.TE.tryCatch(async () => {
        ctx.logger.debug.log("Initializing tools from MCP client...");

        // Get tools from MCP servers
        let mcpTools: StructuredToolInterface[] = [];
        if (opts.mcpClient) {
          mcpTools = await opts.mcpClient.getTools();
          ctx.logger.info.log(`Loaded ${mcpTools.length} MCP tools`);
        } else {
          ctx.logger.warn.log("MCP client not available, tools will be empty");
        }

        cachedTools = [
          ...mcpTools,
          createWebScrapingTool(ctx),
          createSearchWebTool(ctx),
        ];

        ctx.logger.debug.log(
          `Tools ready (${cachedTools.length}): %O`,
          cachedTools.reduce(
            (acc, t) => ({ ...acc, [t.name]: t.description }),
            {},
          ),
        );

        return cachedTools;
      }, toAgentError);

      return initializeToolsTask;
    };

    /**
     * Create an agent with optional provider override
     */
    return (override?: ProviderConfigOverride) => {
      return pipe(
        getOrInitializeTools(),
        fp.TE.chain((tools) =>
          fp.TE.fromEither(
            fp.E.tryCatch(() => {
              // Merge config: use override if provided, otherwise use default
              const mergedConfig = mergeProviderConfig(
                ctx.langchain.options,
                override,
              );

              ctx.logger.info.log("Creating agent with provider config: %O", {
                provider: mergedConfig.provider,
                model: mergedConfig.model,
              });

              // Create a temporary Langchain provider with merged config
              // This allows us to switch providers on a per-request basis
              // Type assertion needed because provider is dynamic at runtime
              const tempLangchainProvider = GetLangchainProvider({
                baseURL: ctx.langchain.options.baseURL,
                apiKey: ctx.langchain.options.apiKey,
                maxRetries: ctx.langchain.options.maxRetries,
                provider: mergedConfig.provider,
                models: {
                  chat: mergedConfig.model,
                  embeddings: ctx.langchain.options.models?.embeddings,
                },
                options: {
                  chat: (mergedConfig.options ?? {}) as never,
                  embeddings: (ctx.langchain.options.options?.embeddings ??
                    {}) as never,
                },
              });

              // Create agent with the custom chat model
              return createAgentWithProvider(
                tempLangchainProvider.chat,
                tools,
                ctx.logger,
              );
            }, toAgentError),
          ),
        ),
      );
    };
  };
