/**
 * Agent Factory: Creates agents on-demand with custom provider configurations
 *
 * This module provides functionality to create agents dynamically without requiring
 * server restart when switching between AI providers (OpenAI, Anthropic, XAI).
 */

import path from "path";
import { type StructuredToolInterface } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { AgentType, AIConfig } from "@liexp/io/lib/http/Chat.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { createAgent as createReactAgent, type ReactAgent } from "langchain";
import { type BraveProviderContext } from "../../context/brave.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { ServerError } from "../../errors/index.js";
import { GetLangchainProvider, type AIProvider } from "./langchain.provider.js";
import { createReadDocumentationTool } from "./tools/readDocumentation.tool.js";
import { createSearchWebTool } from "./tools/searchWeb.tools.js";
import {
  buildSkillsAddendum,
  createLoadSkillTool,
  loadSkills,
  type Skill,
} from "./tools/skills.js";
import { createWebScrapingTool } from "./tools/webScraping.tools.js";

export type Agent = ReactAgent;

/**
 * Configuration override for creating an agent with custom provider settings
 */
export interface ProviderConfigOverride {
  provider?: AIProvider;
  model?: string;
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
  model: string;
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
      "Full-capability assistant — manages platform resources and researches the web, loading skills on demand",
    systemPromptFile: "AGENTS.md",
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
  /** Path to the skills directory (defaults to <cwd>/skills) */
  skillsDir?: string;
}

/**
 * Create a single-agent React agent with a specific Langchain provider.
 * Each agent owns a MemorySaver checkpointer so conversation history persists
 * across requests (the factory caches the compiled agent, see GetAgentFactory).
 */
const createAgentWithProvider = (
  systemPrompt: string,
  chat: LangchainContext["langchain"]["chat"],
  tools: StructuredToolInterface[],
  logger: LoggerContext["logger"],
): Agent => {
  const agent = createReactAgent({
    model: chat,
    tools,
    checkpointer: new MemorySaver(),
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
 * Agent Factory: Creates agents on-demand with optional provider overrides
 *
 * Caches MCP tools, system prompts, and compiled agents to avoid re-fetching /
 * rebuilding on every request. Caching the compiled agent is what keeps each
 * agent's MemorySaver checkpointer alive across requests so conversation history
 * persists (keyed by agent type + resolved provider/model/options).
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
    // Compiled-agent cache keyed by type + resolved provider config. Keeps the
    // checkpointer alive across requests so conversation history persists.
    const agentCache = new Map<string, Agent>();

    /**
     * Load skills from the skills directory (cached).
     */
    const skillsDir = opts.skillsDir ?? path.resolve(process.cwd(), "skills");
    ctx.logger.debug.log("Loading skills from: %s", skillsDir);
    const skillsTask: TaskEither<ServerError, Skill[]> = pipe(
      loadSkills(skillsDir),
      fp.TE.tap((skills) =>
        fp.TE.fromIO(() => {
          ctx.logger.info.log("Loaded %d skills", skills.length);
        }),
      ),
    );

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
        skillsTask,
        fp.TE.chain((skills) =>
          fp.TE.tryCatch(async () => {
            ctx.logger.debug.log("Initializing tools for agent type: %s", type);

            const webScraping = createWebScrapingTool(ctx);
            const searchWeb = createSearchWebTool(ctx);
            const loadSkill = createLoadSkillTool(skills);

            let tools: StructuredToolInterface[];

            if (type === "researcher") {
              // Researcher: web tools + skills only — no MCP, no CLI
              tools = [searchWeb, webScraping, loadSkill];
            } else {
              // Platform (default): CLI + MCP + web tools + skills + documentation reader
              let mcpTools: StructuredToolInterface[] = [];
              if (opts.mcpClient) {
                mcpTools = await opts.mcpClient.getTools();
                ctx.logger.info.log("Loaded %d MCP tools", mcpTools.length);
              } else {
                ctx.logger.warn.log("MCP client not available");
              }
              const readDoc = createReadDocumentationTool(ctx, process.cwd());
              tools = [
                opts.cliTool,
                readDoc,
                loadSkill,
                ...mcpTools,
                webScraping,
                searchWeb,
              ];
            }

            ctx.logger.debug.log(
              "Tools ready for %s (%d): %O",
              type,
              tools.length,
              tools.reduce(
                (acc, t) => ({ ...acc, [t.name]: t.description }),
                {},
              ),
            );

            toolsCache.set(type, tools);
            return tools;
          }, toAgentError),
        ),
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
     * Appends skills descriptions (not full content) to the system prompt.
     * Full skill content is loaded on-demand via the load_skill tool.
     */
    const getOrReadSystemPrompt = (
      type: AgentType,
    ): TaskEither<ServerError, string> => {
      const cached = promptCache.get(type);
      if (cached) return fp.TE.right(cached);

      const promptFile = AGENT_CONFIGS[type].systemPromptFile;
      return pipe(
        fp.TE.Do,
        fp.TE.bind("prompt", () =>
          pipe(
            ctx.fs.getObject(path.resolve(process.cwd(), promptFile)),
            fp.TE.mapLeft(ServerError.fromUnknown),
          ),
        ),
        fp.TE.bind("skills", () => skillsTask),
        fp.TE.map(({ prompt, skills }) => prompt + buildSkillsAddendum(skills)),
        fp.TE.tap((systemPrompt) =>
          fp.TE.fromIO(() => {
            promptCache.set(type, systemPrompt);
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
        opts.apiKeys?.[mergedConfig.provider] ?? ctx.langchain.options.apiKey;
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
          embeddings: ctx.langchain.options.options?.embeddings ?? {},
        },
      });
    };

    /** Cache key for a compiled agent — agent type + resolved provider config. */
    const agentCacheKey = (
      type: AgentType,
      override?: ProviderConfigOverride,
    ): string => {
      const m = mergeProviderConfig(ctx.langchain.options, override);
      return `${type}|${m.provider}|${m.model}|${JSON.stringify(m.options ?? {})}`;
    };

    /** Build a single-agent React agent for the given type. */
    const buildSingleAgent = (
      type: AgentType,
      override?: ProviderConfigOverride,
    ): TaskEither<ServerError, Agent> =>
      pipe(
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

    /**
     * Create (or return the cached) agent for the given type and provider override.
     *
     * There is a single full-capability agent (tools: CLI + MCP + web + docs +
     * skills) used for "auto" and "platform". "researcher" is an optional
     * read-only variant (web + skills, no CLI) selected explicitly by the user.
     * Domain workflows live in skills (loaded on demand), not the base prompt.
     */
    return (agentType?: AgentType, override?: ProviderConfigOverride) => {
      const type: AgentType = agentType ?? "auto";
      const key = agentCacheKey(type, override);

      const cached = agentCache.get(key);
      if (cached) return fp.TE.right(cached);

      return pipe(
        buildSingleAgent(type, override),
        fp.TE.map((agent) => {
          agentCache.set(key, agent);
          return agent;
        }),
      );
    };
  };
