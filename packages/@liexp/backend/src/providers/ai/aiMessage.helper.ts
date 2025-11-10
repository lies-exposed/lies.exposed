import { type Logger } from "@liexp/core/lib/index.js";
import { type ToolCall, type AIMessage } from "langchain";

export const AIMessageLogger = (logger: Logger) => (message: AIMessage) => {
  const tool_calls = "tool_calls" in message ? (message.tool_calls ?? []) : [];

  tool_calls.forEach((t: ToolCall) => {
    logger.info.log(`Run tool: %s: %O`, t.name, t.args);
  });

  const content = message.content;
  if (content !== "") {
    logger.info.log(content);
  }
};
