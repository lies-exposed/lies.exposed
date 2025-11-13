import { type Logger } from "@liexp/core/lib/index.js";
import { type ToolCall, type AIMessage } from "langchain";

export const AIMessageLogger = (logger: Logger) => (message: AIMessage) => {
  // Log message type/role if available
  const messageType =
    "_getType" in message
      ? (message._getType as () => string)()
      : message.constructor.name;

  // Log tool calls (when AI decides to use a tool)
  const tool_calls = "tool_calls" in message ? (message.tool_calls ?? []) : [];
  if (tool_calls.length > 0) {
    tool_calls.forEach((t: ToolCall) => {
      logger.info.log(`[${messageType}] Run tool: %s`, t.name);
      logger.debug.log(`Tool arguments: %O`, t.args);
    });
  }

  // Log invalid tool calls if present (errors in tool usage)
  const invalid_tool_calls =
    "invalid_tool_calls" in message ? message.invalid_tool_calls : undefined;
  if (invalid_tool_calls && Array.isArray(invalid_tool_calls)) {
    invalid_tool_calls.forEach((itc: unknown) => {
      logger.error.log(`[${messageType}] Invalid tool call: %O`, itc);
    });
  }

  // Log tool call ID (for tool response messages)
  if ("tool_call_id" in message && message.tool_call_id) {
    logger.debug.log(`[${messageType}] Tool call ID: %s`, message.tool_call_id);
  }

  // Log response metadata (model info, tokens usage, etc.)
  const response_metadata =
    "response_metadata" in message ? message.response_metadata : undefined;
  if (response_metadata && typeof response_metadata === "object") {
    const metadata = response_metadata as Record<string, unknown>;
    if (metadata.model) {
      logger.debug.log(`[${messageType}] Model: %s`, metadata.model);
    }
    if (metadata.finish_reason) {
      logger.debug.log(
        `[${messageType}] Finish reason: %s`,
        metadata.finish_reason,
      );
    }
  }

  // Log usage metadata (token counts)
  const usage_metadata =
    "usage_metadata" in message ? message.usage_metadata : undefined;
  if (usage_metadata && typeof usage_metadata === "object") {
    const usage = usage_metadata as Record<string, unknown>;
    if (
      typeof usage.input_tokens === "number" ||
      typeof usage.output_tokens === "number" ||
      typeof usage.total_tokens === "number"
    ) {
      logger.info.log(
        `[${messageType}] Token usage: input=%d, output=%d, total=%d`,
        usage.input_tokens ?? 0,
        usage.output_tokens ?? 0,
        usage.total_tokens ?? 0,
      );
    }
  }

  // Log message name if available (useful for function/tool messages)
  if ("name" in message && message.name) {
    logger.debug.log(`[${messageType}] Name: %s`, message.name);
  }

  // Log main content (the actual message text or response)
  const content = message.content;
  if (content !== "") {
    if (typeof content === "string") {
      logger.info.log(`[${messageType}] ${content}`);
    } else {
      // Handle complex content (arrays, objects, etc.)
      logger.info.log(`[${messageType}] Content: %O`, content);
    }
  }
};
