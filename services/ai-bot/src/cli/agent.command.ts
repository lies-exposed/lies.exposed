import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import prompts from "prompts";
import { toAIBotError } from "../common/error/index.js";
import { type CommandFlow } from "./CommandFlow.js";

// const GraphState = Annotation.Root({
//   messages: Annotation<BaseMessage[]>({
//     reducer: (x, y) => x.concat(y),
//     default: () => [],
//   }),
// });

// export const ConfigurationSchema = Annotation.Root({
//   /**
//    * The system prompt to be used by the agent.
//    */
//   systemPromptTemplate: Annotation<string>,

//   /**
//    * The name of the language model to be used by the agent.
//    */
//   model: Annotation<string>,
// });

// Define the function that determines whether to continue or not
// function routeModelOutput(state: typeof MessagesAnnotation.State): string {
//   const messages = state.messages;
//   const lastMessage = messages[messages.length - 1];
//   // If the LLM is invoking tools, route there.
//   if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
//     return "tools";
//   }
//   // Otherwise end the graph.
//   else {
//     return "__end__";
//   }
// }

export const agentCommand: CommandFlow = async (ctx, args) => {
  // Initialize memory to persist state between graph runs

  const agentCheckpointer = new MemorySaver();
  const agent = createReactAgent({
    llm: ctx.langchain.chat,
    tools: [],
    checkpointSaver: agentCheckpointer,
  });

  const ask = async (ag: typeof agent, message: string) => {
    const agentFinalState = await ag.stream(
      {
        messages: [message],
      },
      { configurable: { thread_id: "42" } },
    );

    const messages = [];
    for await (const chunk of agentFinalState) {
      ctx.logger.debug.log(`Chunk %O`, chunk.agent.messages);
      messages.push(chunk);
    }
    return messages;
  };

  const chat = async (ag: typeof agent) => {
    const { question } = await prompts({
      message: 'Enter a command (type "exit" to quit):',
      type: "text",
      name: "question",
    });

    if (question.toLowerCase() === "exit") {
      ctx.logger.info.log("Goodbye!");
      return;
    } else {
      const result = await ask(ag, question);

      ctx.logger.debug.log("Answer %O", result);

      await chat(ag);
    }
  };

  return pipe(
    fp.TE.tryCatch(async () => {
      // Init the chat loop!
      await chat(agent);
    }, toAIBotError),
    throwTE,
  );
};
