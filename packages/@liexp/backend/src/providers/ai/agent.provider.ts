import { readFileSync } from "fs";
import path from "path";
import {
  type ZodObjectV4,
  type ZodObjectV3,
  type InteropZodObject,
} from "@langchain/core/utils/types";
import { type AnnotationRoot, MemorySaver } from "@langchain/langgraph";
import { type MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import {
  type AgentMiddleware,
  type AIMessage,
  createAgent as createReactAgent,
  type ReactAgent,
  type ResponseFormatUndefined,
  type Tool,
} from "langchain";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { ServerError } from "../../errors/index.js";
import { AIMessageLogger } from "./aiMessage.helper.js";
import { createWebScrapingTool } from "./tools/webScraping.tools.js";

export type Agent = ReactAgent<
  ResponseFormatUndefined,
  AnnotationRoot<any> | ZodObjectV3 | ZodObjectV4,
  AnnotationRoot<any> | ZodObjectV3 | ZodObjectV4,
  readonly AgentMiddleware<any, any, any>[]
>;

export interface AgentProvider {
  agent: Agent;
  tools: Tool[];
  createAgent: (
    opts: Partial<Parameters<typeof createReactAgent>[0]>,
  ) => ReactAgent;
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

export const GetAgentProvider =
  (opts: GetAgentProviderOptions) =>
  <C extends LangchainContext & LoggerContext & PuppeteerProviderContext>(
    ctx: C,
  ): TaskEither<ServerError, AgentProvider> => {
    const aiMessageLogger = AIMessageLogger(ctx.logger);

    const agent = fp.TE.tryCatch(async () => {
      // Get tools from MCP servers
      const mcpTools = await opts.mcpClient.getTools();

      // Combine MCP tools with custom tools
      const allTools = [...mcpTools, createWebScrapingTool(ctx)];

      // Initialize memory to persist state between graph runs

      const agentCheckpointer = new MemorySaver();

      const agent = createReactAgent({
        model: ctx.langchain.chat.withConfig({
          tool_choice: "auto",
          verbosity: "high",
        }),
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
        `Agent tools: %O`,
        allTools.reduce((acc, t) => ({ ...acc, [t.name]: t.description }), {}),
      );

      const invoke = (
        input: Parameters<typeof agent.invoke>[0],
        options: Parameters<typeof agent.invoke>[1],
      ): TaskEither<ServerError, Awaited<ReturnType<typeof agent.invoke>>> =>
        fp.TE.tryCatch(() => {
          ctx.logger.info.log(`Invoke agent with %O (%O)`, input, options);
          return agent.invoke(input, options);
        }, toAgentError);

      const stream = (
        input: Parameters<typeof agent.stream>[0],
        options: Parameters<typeof agent.stream>[1],
      ) =>
        fp.TE.tryCatch(async () => {
          ctx.logger.info.log(`Invoke agent with %O (%O)`, input, options);
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
          model: ctx.langchain.chat.withConfig({
            tool_choice: "auto",
            verbosity: "high",
          }),
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
