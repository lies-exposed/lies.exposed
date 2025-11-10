import { readFileSync } from "fs";
import path from "path";
import { MemorySaver, type AnnotationRoot } from "@langchain/langgraph";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import {
  createAgent as createReactAgent,
  type AgentMiddleware,
  type AIMessage,
  type ReactAgent,
  type ResponseFormatUndefined,
  type Tool,
} from "langchain";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { ServerError } from "../../errors/index.js";
import { AIMessageLogger } from "./aiMessage.helper.js";
import * as ToolNames from "./toolNames.constants.js";
import { createWebScrapingTool } from "./tools/webScraping.tools.js";

export type Agent = ReactAgent<
  ResponseFormatUndefined,
  undefined,
  AnnotationRoot<any>,
  readonly AgentMiddleware<any, any, any>[]
>;

export interface AgentProvider {
  agent: Agent;
  tools: Tool[];
  createAgent: (opts: Partial<Parameters<typeof createReactAgent>[0]>) => Agent;
  invoke: (
    input: Parameters<Agent["invoke"]>[0],
    options: Parameters<Agent["invoke"]>[1],
  ) => TaskEither<ServerError, Awaited<ReturnType<Agent["invoke"]>>>;
  stream: (
    input: Parameters<Agent["stream"]>[0],
    options: Parameters<Agent["stream"]>[1],
  ) => TaskEither<ServerError, AIMessage[]>;
}

const toAgentError = (e: unknown) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(e, null, 2));
  return ServerError.fromUnknown(e);
};

interface GetAgentProviderOptions {
  mcpClient: MultiServerMCPClient;
}

/**
 * Filters tools based on provider compatibility.
 * xAI has stricter requirements for tool schemas, so we exclude tools with:
 * - Deeply nested unions (e.g., Union(Union(...), Undefined))
 * - Complex array schemas with unions or structs
 * - Multiple levels of nullable/optional fields
 * - EventType enums and other complex union types
 */
const filterToolsForProvider = (
  tools: Tool[],
  provider: "openai" | "xai",
): Tool[] => {
  if (provider === "openai") {
    return tools; // OpenAI supports all tool schemas
  }

  // For xAI, enable tools incrementally - test one at a time
  // All schemas have been simplified to avoid nested unions
  const allowedForXAI = new Set([
    // Phase 1: Basic tools (TESTED ✓)
    ToolNames.BLOCK_NOTE_TO_TEXT, // Simple text conversion
    // actor tools
    ToolNames.CREATE_ACTOR, // Actor creation with simplified schema
    // ToolNames.FIND_ACTORS, //Search actors (simplified schema - no nested unions)
    // media
    ToolNames.UPLOAD_MEDIA_FROM_URL, // TEST: Upload image from URL
    ToolNames.CREATE_MEDIA, // TEST: Create media entity
    // ToolNames.FIND_MEDIA, // TEST: Search media (simplified schema)
  ]);

  const filteredTools = tools.filter((tool) => allowedForXAI.has(tool.name));

  return filteredTools;
};

export const GetAgentProvider =
  (opts: GetAgentProviderOptions) =>
  <C extends LangchainContext & LoggerContext & PuppeteerProviderContext>(
    ctx: C,
  ): TaskEither<ServerError, AgentProvider> => {
    const aiMessageLogger = AIMessageLogger(ctx.logger);

    const agent = fp.TE.tryCatch(async () => {
      // Get tools from MCP servers
      const mcpTools = await opts.mcpClient.getTools();

      ctx.logger.info.log(
        `Loaded ${mcpTools.length} MCP tools for provider: ${ctx.langchain.options.provider}`,
      );

      // Filter tools based on provider compatibility
      const filteredMcpTools = filterToolsForProvider(
        mcpTools,
        ctx.langchain.options.provider,
      );

      if (filteredMcpTools.length < mcpTools.length) {
        const filtered = mcpTools.filter(
          (t) => !filteredMcpTools.find((ft) => ft.name === t.name),
        );
        ctx.logger.warn.log(
          `Filtered out ${filtered.length} tools for xAI compatibility: ${filtered.map((t) => t.name).join(", ")}`,
        );
      }

      // Combine MCP tools with custom tools
      const allTools: Tool[] = [
        ...filteredMcpTools,
        createWebScrapingTool(ctx),
      ];

      // Initialize memory to persist state between graph runs

      const agentCheckpointer = new MemorySaver();

      const agent = createReactAgent({
        model: ctx.langchain.chat,
        tools: allTools,
        checkpointer: agentCheckpointer,
        systemPrompt: readFileSync(
          path.resolve(process.cwd(), "AGENT.md"),
          "utf-8",
        ),
        description: "A React agent for handling user queries",
      });

      ctx.logger.info.log(`Agent created: %s`, agent.options.description);
      ctx.logger.debug.log(
        `Agent tools (${allTools.length}): %O`,
        allTools.reduce((acc, t) => ({ ...acc, [t.name]: t.description }), {}),
      );

      const invoke = (
        input: Parameters<typeof agent.invoke>[0],
        options: Parameters<typeof agent.invoke>[1],
      ): TaskEither<ServerError, Awaited<ReturnType<typeof agent.invoke>>> =>
        fp.TE.tryCatch(() => {
          ctx.logger.info.log(`agent.invoke with %O (%O)`, input, options);
          return agent.invoke(input, options);
        }, toAgentError);

      const stream = (
        input: Parameters<typeof agent.stream>[0],
        options: Parameters<typeof agent.stream>[1],
      ) =>
        fp.TE.tryCatch(async () => {
          ctx.logger.info.log(`agent.stream with %O (%O)`, input, options);
          const stream = await agent.stream(input, options);

          const result: AIMessage[] = [];
          for await (const chunk of stream) {
            ctx.logger.debug.log(`Stream chunk: %O`, chunk);
            if (Array.isArray(chunk.agent?.messages)) {
              result.push(...(chunk.agent.messages as AIMessage[]));
            }

            const messages = (chunk.agent?.messages ??
              chunk.tools?.messages ??
              []) as AIMessage[];

            messages.forEach(aiMessageLogger);
          }

          return result;
        }, toAgentError);

      const createAgent = (
        opts: Partial<Parameters<typeof createReactAgent>[0]>,
      ) => {
        return createReactAgent({
          model: ctx.langchain.chat,
          tools: allTools,
          checkpointer: agentCheckpointer,
          systemPrompt: readFileSync(
            path.resolve(process.cwd(), "AGENT.md"),
            "utf-8",
          ),
          description: "A React agent for handling user queries",
          ...opts,
        });
      };

      return { agent, tools: allTools, invoke, stream, createAgent };
    }, ServerError.fromUnknown);

    return agent;
  };
