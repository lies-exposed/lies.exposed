/**
 * Agent Factory: Creates agents on-demand with custom provider configurations
 *
 * This module provides functionality to create agents dynamically without requiring
 * server restart when switching between AI providers (OpenAI, Anthropic, XAI).
 */

import path from "path";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import {
  Command,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — package exports subpath not recognised by node10 moduleResolution
import { createReactAgent as createLangGraphReactAgent } from "@langchain/langgraph/prebuilt";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { AgentType, AIConfig } from "@liexp/io/lib/http/Chat.js";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { createAgent as createReactAgent, type ReactAgent } from "langchain";
import { type BraveProviderContext } from "../../context/brave.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
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

export const AGENT_CONFIGS: Record<
  AgentType,
  { label: string; description: string; systemPromptFile: string }
> = {
  auto: {
    label: "Auto",
    description:
      "Automatically routes to the best agent — Platform Manager or Researcher — based on your request",
    systemPromptFile: "AGENTS.md", // unused for auto, supervisor decides routing
  },
  platform: {
    label: "Platform Manager",
    description:
      "Manages platform resources (actors, events, groups, links) via the CLI",
    systemPromptFile: "AGENTS.md",
  },
  researcher: {
    label: "Researcher",
    description:
      "Web research specialist — knows where to look and what to search for",
    systemPromptFile: "RESEARCHER.md",
  },
};

interface AgentFactoryOptions {
  mcpClient: MultiServerMCPClient | null;
  /** CLI executor tool used exclusively by the platform agent */
  cliTool: StructuredToolInterface;
  /** Per-provider API keys — used when an override switches to a different provider */
  apiKeys?: Partial<Record<AIProvider, string>>;
}

/**
 * Create an agent with a specific Langchain provider
 * Used internally by the factory to construct agents
 */
const createAgentWithProvider = (
  systemPrompt: string,
  chat: LangchainContext["langchain"]["chat"],
  tools: StructuredToolInterface[],
  logger: LoggerContext["logger"],
): Agent => {
  const agentCheckpointer = new MemorySaver();

  const agent = createReactAgent({
    model: chat,
    tools,
    checkpointer: agentCheckpointer,
    systemPrompt,
    description: "A React agent for handling user queries",
  });

  logger.debug.log(
    "Agent created with chat model: %O",
    (chat as unknown as { model?: string }).model ?? "unknown",
  );

  return agent;
};

/**
 * Create a multi-agent orchestrator graph.
 *
 * Architecture:
 *   START → supervisor → platform ⇄ researcher → END
 *
 * The supervisor LLM classifies the user's message and routes to the appropriate
 * subagent. Each subagent has a handoff tool to transfer control to the other.
 * The outer graph owns the MemorySaver, so conversation history is shared.
 */
const createMultiAgentGraph = (
  platformTools: StructuredToolInterface[],
  researcherTools: StructuredToolInterface[],
  platformPrompt: string,
  researcherPrompt: string,
  chat: LangchainContext["langchain"]["chat"],
  logger: LoggerContext["logger"],
): Agent => {
  // Handoff tools — return a Command to route to the target node
  const transferToResearcher = tool(
    async () =>
      new Command({
        goto: "researcher",
      }),
    {
      name: "transfer_to_researcher",
      description:
        "Delegate to the Researcher agent for web research, fact-checking, or finding information online. Use this when you need current information from the web.",
      schema: effectToZod(Schema.Struct({})),
      returnDirect: true,
    },
  );

  const transferToPlatform = tool(
    async () =>
      new Command({
        goto: "platform",
      }),
    {
      name: "transfer_to_platform",
      description:
        "Transfer back to the Platform Manager after completing research so it can act on the findings.",
      schema: effectToZod(Schema.Struct({})),
      returnDirect: true,
    },
  );

  // Subagents: use LangGraph's createReactAgent (returns CompiledStateGraph,
  // compatible with StateGraph.addNode). No checkpointer — outer graph manages state.
  const platformAgent = createLangGraphReactAgent({
    model: chat,
    tools: [...platformTools, transferToResearcher],
    prompt: platformPrompt,
  });

  const researcherAgent = createLangGraphReactAgent({
    model: chat,
    tools: [...researcherTools, transferToPlatform],
    prompt: researcherPrompt,
  });

  // Supervisor: one LLM call to classify and route the initial message
  const supervisorNode = async (
    state: typeof MessagesAnnotation.State,
  ): Promise<Command> => {
    const lastMessage = state.messages.at(-1);
    const content =
      typeof lastMessage?.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage?.content ?? "");

    const response = await (chat as any).invoke([
      {
        role: "system",
        content: [
          "You are a router for a fact-checking platform assistant.",
          "Choose which specialized agent handles this request:",
          '- "platform": create, edit, list, or manage platform resources (actors, events, groups, links, keywords, stories)',
          '- "researcher": find information online, web research, fact-checking, search for people/organizations/events',
          'Reply with ONLY the agent name: "platform" or "researcher".',
        ].join("\n"),
      },
      { role: "user", content },
    ]);

    const text = (
      typeof response.content === "string" ? response.content : "platform"
    )
      .trim()
      .toLowerCase();

    const next = text.includes("researcher") ? "researcher" : "platform";
    logger.info.log("Supervisor routing to: %s", next);
    return new Command({ goto: next });
  };

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("supervisor", supervisorNode, {
      ends: ["platform", "researcher"],
    })
    .addNode("platform", platformAgent)
    .addNode("researcher", researcherAgent)
    .addEdge(START, "supervisor")
    .compile({ checkpointer: new MemorySaver() });

  logger.debug.log("Multi-agent graph created");
  return graph as unknown as Agent;
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
      BraveProviderContext &
      FSClientContext,
  >(
    ctx: C,
  ): ((
    agentType?: AgentType,
    override?: ProviderConfigOverride,
  ) => TaskEither<ServerError, Agent>) => {
    // Per-agent-type caches for tools and system prompts
    const toolsCache = new Map<AgentType, StructuredToolInterface[]>();
    const toolsTaskCache = new Map<
      AgentType,
      TaskEither<ServerError, StructuredToolInterface[]>
    >();
    const promptCache = new Map<AgentType, string>();

    /**
     * Initialize tools for a specific agent type, cached per type.
     */
    const getOrInitializeTools = (
      type: AgentType,
    ): TaskEither<ServerError, StructuredToolInterface[]> => {
      const cached = toolsCache.get(type);
      if (cached) return fp.TE.right(cached);

      const inFlight = toolsTaskCache.get(type);
      if (inFlight) return inFlight;

      const task: TaskEither<ServerError, StructuredToolInterface[]> = pipe(
        fp.TE.tryCatch(async () => {
          ctx.logger.debug.log(
            "Initializing tools for agent type: %s",
            type,
          );

          const webScraping = createWebScrapingTool(ctx);
          const searchWeb = createSearchWebTool(ctx);

          let tools: StructuredToolInterface[];

          if (type === "researcher") {
            // Researcher: web tools only — no MCP, no CLI
            tools = [searchWeb, webScraping];
          } else {
            // Platform (default): CLI + MCP + web tools
            let mcpTools: StructuredToolInterface[] = [];
            if (opts.mcpClient) {
              mcpTools = await opts.mcpClient.getTools();
              ctx.logger.info.log("Loaded %d MCP tools", mcpTools.length);
            } else {
              ctx.logger.warn.log("MCP client not available");
            }
            tools = [opts.cliTool, ...mcpTools, webScraping, searchWeb];
          }

          ctx.logger.debug.log(
            "Tools ready for %s (%d): %O",
            type,
            tools.length,
            tools.reduce((acc, t) => ({ ...acc, [t.name]: t.description }), {}),
          );

          toolsCache.set(type, tools);
          return tools;
        }, toAgentError),
        fp.TE.orElse((error) => {
          toolsTaskCache.delete(type);
          return fp.TE.left(error);
        }),
      );

      toolsTaskCache.set(type, task);
      return task;
    };

    /**
     * Read the system prompt file for a specific agent type, cached per type.
     */
    const getOrReadSystemPrompt = (
      type: AgentType,
    ): TaskEither<ServerError, string> => {
      const cached = promptCache.get(type);
      if (cached) return fp.TE.right(cached);

      const promptFile = AGENT_CONFIGS[type].systemPromptFile;
      return pipe(
        ctx.fs.getObject(path.resolve(process.cwd(), promptFile)),
        fp.TE.mapLeft(ServerError.fromUnknown),
        fp.TE.tap((prompt) =>
          fp.TE.fromIO(() => {
            promptCache.set(type, prompt);
          }),
        ),
      );
    };

    /**
     * Build the resolved LangChain chat model for a given provider override.
     * When the override switches provider, use the matching API key from opts.apiKeys
     * rather than falling back to the default provider's key.
     */
    const resolveChatModel = (override?: ProviderConfigOverride) => {
      const mergedConfig = mergeProviderConfig(ctx.langchain.options, override);
      const apiKey =
        (opts.apiKeys?.[mergedConfig.provider as AIProvider] ??
          ctx.langchain.options.apiKey);
      return GetLangchainProvider({
        baseURL: ctx.langchain.options.baseURL,
        apiKey,
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
    };

    /**
     * Create an agent with optional agent type and provider override.
     * When agentType is "auto", builds a multi-agent orchestrator graph.
     */
    return (agentType?: AgentType, override?: ProviderConfigOverride) => {
      const type: AgentType = agentType ?? "auto";

      // Multi-agent orchestrator
      if (type === "auto") {
        return pipe(
          fp.TE.Do,
          fp.TE.bind("platformTools", () => getOrInitializeTools("platform")),
          fp.TE.bind("researcherTools", () =>
            getOrInitializeTools("researcher"),
          ),
          fp.TE.bind("platformPrompt", () => getOrReadSystemPrompt("platform")),
          fp.TE.bind("researcherPrompt", () =>
            getOrReadSystemPrompt("researcher"),
          ),
          fp.TE.chain(
            ({
              platformTools,
              researcherTools,
              platformPrompt,
              researcherPrompt,
            }) =>
              fp.TE.fromEither(
                fp.E.tryCatch(() => {
                  const { chat } = resolveChatModel(override);
                  ctx.logger.info.log(
                    "Creating auto multi-agent graph with provider config: %O",
                    {
                      provider: mergeProviderConfig(
                        ctx.langchain.options,
                        override,
                      ).provider,
                    },
                  );
                  return createMultiAgentGraph(
                    platformTools,
                    researcherTools,
                    platformPrompt,
                    researcherPrompt,
                    chat,
                    ctx.logger,
                  );
                }, toAgentError),
              ),
          ),
        );
      }

      // Single-agent (platform or researcher)
      return pipe(
        fp.TE.Do,
        fp.TE.bind("tools", () => getOrInitializeTools(type)),
        fp.TE.bind("systemPrompt", () => getOrReadSystemPrompt(type)),
        fp.TE.chain(({ tools, systemPrompt }) =>
          fp.TE.fromEither(
            fp.E.tryCatch(() => {
              const { chat } = resolveChatModel(override);

              ctx.logger.info.log(
                "Creating %s agent with provider config: %O",
                type,
                {
                  provider: mergeProviderConfig(ctx.langchain.options, override)
                    .provider,
                },
              );

              return createAgentWithProvider(
                systemPrompt,
                chat,
                tools,
                ctx.logger,
              );
            }, toAgentError),
          ),
        ),
      );
    };
  };
