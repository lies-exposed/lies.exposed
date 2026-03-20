import { describe, expect, it, vi } from "vitest";
import { AIMessageLogger } from "./aiMessage.helper.js";

const createMockLogger = () => ({
  info: { log: vi.fn() },
  debug: { log: vi.fn() },
  warn: { log: vi.fn() },
  error: { log: vi.fn() },
  extend: vi.fn().mockReturnThis(),
});

describe("AIMessageLogger", () => {
  it("should log message type", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "Hello",
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).toHaveBeenCalled();
  });

  it("should log tool calls when present", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "Let me search for that",
      tool_calls: [
        { name: "search", args: { query: "test" } },
        { name: "fetch", args: { url: "https://example.com" } },
      ],
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).toHaveBeenCalledWith(
      "[ai] Run tool: %s",
      "search",
    );
    expect(logger.debug.log).toHaveBeenCalledWith(
      "Tool arguments: %O",
      { query: "test" },
    );
  });

  it("should log invalid tool calls", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "",
      invalid_tool_calls: [{ name: "unknown_tool", error: "Tool not found" }],
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.error.log).toHaveBeenCalledWith(
      "[ai] Invalid tool call: %O",
      { name: "unknown_tool", error: "Tool not found" },
    );
  });

  it("should log tool call ID", () => {
    const logger = createMockLogger();
    const message = {
      type: "tool",
      content: "Here is the result",
      tool_call_id: "call_123",
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.debug.log).toHaveBeenCalledWith(
      "[tool] Tool call ID: %s",
      "call_123",
    );
  });

  it("should log response metadata with model info", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "Response",
      response_metadata: {
        model: "claude-3-sonnet",
        finish_reason: "stop",
      },
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.debug.log).toHaveBeenCalledWith(
      "[ai] Model: %s",
      "claude-3-sonnet",
    );
    expect(logger.debug.log).toHaveBeenCalledWith(
      "[ai] Finish reason: %s",
      "stop",
    );
  });

  it("should log usage metadata with token counts", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "Response",
      usage_metadata: {
        input_tokens: 100,
        output_tokens: 50,
        total_tokens: 150,
      },
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).toHaveBeenCalledWith(
      "[ai] Token usage: input=%d, output=%d, total=%d",
      100,
      50,
      150,
    );
  });

  it("should log message name when present", () => {
    const logger = createMockLogger();
    const message = {
      type: "tool",
      content: "Tool result",
      name: "search_results",
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.debug.log).toHaveBeenCalledWith(
      "[tool] Name: %s",
      "search_results",
    );
  });

  it("should log string content", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "This is a test message",
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).toHaveBeenCalledWith(
      "[ai] This is a test message",
    );
  });

  it("should log complex content as object", () => {
    const logger = createMockLogger();
    const complexContent = [{ type: "text", text: "Hello" }, { type: "image", url: "..." }];
    const message = {
      type: "ai",
      content: complexContent,
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).toHaveBeenCalledWith(
      "[ai] Content: %O",
      complexContent,
    );
  });

  it("should not log content when empty", () => {
    const logger = createMockLogger();
    const message = {
      type: "ai",
      content: "",
    } as any;

    AIMessageLogger(logger as any)(message);

    expect(logger.info.log).not.toHaveBeenCalled();
  });
});
