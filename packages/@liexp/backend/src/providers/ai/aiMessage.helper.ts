import { type AIMessage } from "@langchain/core/dist/messages/ai";
import { type Logger } from "@liexp/core/lib/index.js";

export const AIMessageLogger = (logger: Logger) => (message: AIMessage) => {
  const content = message.content;

  const tool_calls = "tool_calls" in message ? (message.tool_calls ?? []) : [];

  if (content !== "") {
    logger.info.log(`Content: %O`, content);
  }

  tool_calls.forEach((t) => {
    logger.info.log(`Run tool: %s: %O`, t.name, t.args);
  });
};
