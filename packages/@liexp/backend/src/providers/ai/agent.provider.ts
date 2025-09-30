import { readFileSync } from "fs";
import path from "path";
import { type AIMessage, type ToolMessage } from "@langchain/core/messages.js";
import { type DynamicStructuredTool } from "@langchain/core/tools.js";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ServerError } from "../../errors/index.js";
import { AIMessageLogger } from "./aiMessage.helper.js";

type Agent = ReturnType<typeof createReactAgent>;

export type AgentProvider = {
  agent: Agent;
  tools: DynamicStructuredTool[];
  invoke: (
    input: Parameters<Agent["invoke"]>[0],
    options: Parameters<Agent["invoke"]>[1],
  ) => TaskEither<ServerError, Awaited<ReturnType<Agent["invoke"]>>>;
  stream: (
    input: Parameters<Agent["stream"]>[0],
    options: Parameters<Agent["stream"]>[1],
  ) => TaskEither<ServerError, (ToolMessage | AIMessage)[]>;
};

const toAgentError = (e: unknown) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(e, null, 2));
  return ServerError.fromUnknown(e);
};

export const GetAgentProvider =
  () =>
  <C extends LangchainContext & LoggerContext>(
    ctx: C,
  ): TaskEither<ServerError, AgentProvider> => {
    const aiMessageLogger = AIMessageLogger(ctx.logger);

    return fp.TE.tryCatch(async () => {
      // Initialize memory to persist state between graph runs
      const agentCheckpointer = new MemorySaver();

      const agent = createReactAgent({
        llm: ctx.langchain.chat.withConfig({ tool_choice: "required" }),
        tools: [],
        checkpointSaver: agentCheckpointer,
        prompt: readFileSync(path.resolve(process.cwd(), "AGENT.md"), "utf-8"),
      });

      ctx.logger.info.log(`Agent created: %s`, agent.getName());

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

          const result: (ToolMessage | AIMessage)[] = [];
          for await (const chunk of stream) {
            if (Array.isArray(chunk.agent?.messages)) {
              result.push(...(chunk.agent.messages as any[]));
            }

            const messages = (chunk.agent?.messages ??
              chunk.tools?.messages ??
              []) as (ToolMessage | AIMessage)[];

            messages.forEach(aiMessageLogger);
          }
          return result;
        }, toAgentError);

      return Promise.resolve({ agent, tools: [], invoke, stream });
    }, ServerError.fromUnknown);
  };
