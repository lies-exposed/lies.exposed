import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as prompts from "prompts";
import { type AgentContext } from "../context/context.type.js";
import { sendChatMessageStream } from "../flows/chat/chat.flow.js";

export const agentCommand = async (ctx: AgentContext, _args: string[]) => {
  const conversationId = uuid();
  const defaultQuestion = _args[1];

  const ask = async (message: string): Promise<string> => {
    const streamGenerator = sendChatMessageStream({
      message,
      conversation_id: conversationId,
    })(ctx);

    let answer = "";
    for await (const event of streamGenerator) {
      if (event.type === "content_delta" && event.content) {
        if (event.thinking) {
          process.stderr.write(`\x1b[2m${event.content}\x1b[0m`);
        } else {
          process.stdout.write(event.content);
          answer += event.content;
        }
      } else if (event.type === "tool_call_start" && event.tool_call) {
        ctx.logger.info.log(
          "[tool] %s %s",
          event.tool_call.name,
          event.tool_call.arguments,
        );
      } else if (event.type === "tool_call_end" && event.tool_call) {
        ctx.logger.debug.log(
          "[tool result] %s: %s",
          event.tool_call.name,
          event.tool_call.result,
        );
      } else if (event.type === "error") {
        ctx.logger.error.log("Stream error: %s", event.error);
      }
    }
    process.stdout.write("\n");
    return answer;
  };

  const chat = async (): Promise<void> => {
    const { question } = defaultQuestion
      ? await Promise.resolve({ question: defaultQuestion })
      : await prompts.default({
          message: 'Enter a command (type "exit" to quit):',
          type: "text",
          name: "question",
        });

    if (!question || question.toLowerCase() === "exit") {
      ctx.logger.info.log("Goodbye!");
      process.exit(0);
    } else {
      await ask(question);
      await chat();
    }
  };

  return pipe(
    TE.tryCatch(() => chat(), ServerError.fromUnknown),
    throwTE,
  );
};
