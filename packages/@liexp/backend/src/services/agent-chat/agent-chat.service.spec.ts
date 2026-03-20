import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AgentChatService,
  extractJsonFromMarkdown,
  defaultParser,
  type AgentChatServiceTestContext,
} from "./agent-chat.service.js";

const createMockContext = (): AgentChatServiceTestContext => {
  const logger = {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  };

  const chatCreate = vi.fn<() => TE.TaskEither<any, any>>();

  const agent = {
    Chat: {
      Create: chatCreate,
    },
  };

  return {
    logger: logger as any,
    agent: agent as any,
  };
};

const mockChatCreate = (
  ctx: AgentChatServiceTestContext,
  response: any,
) => {
  ctx.agent.Chat.Create = vi.fn().mockImplementation(() =>
    TE.right(response),
  );
};

describe("AgentChatService", () => {
  describe("extractJsonFromMarkdown", () => {
    it("should extract JSON from markdown code block", () => {
      const content = "```json\n{ \"name\": \"test\" }\n```";
      const result = extractJsonFromMarkdown(content);
      expect(result).toBe('{ "name": "test" }');
    });

    it("should extract code without json tag from markdown", () => {
      const content = "```\n{ \"name\": \"test\" }\n```";
      const result = extractJsonFromMarkdown(content);
      expect(result).toBe('{ "name": "test" }');
    });

    it("should return original content if no code block found", () => {
      const content = "plain text content";
      const result = extractJsonFromMarkdown(content);
      expect(result).toBe("plain text content");
    });

    it("should handle JSON with special characters", () => {
      const content = '```json\n{ "message": "Hello \\"World\\"" }\n```';
      const result = extractJsonFromMarkdown(content);
      expect(result).toBe('{ "message": "Hello \\"World\\"" }');
    });

    it("should extract only the first code block", () => {
      const content = "```json\n{ \"first\": true }\n```\n```json\n{ \"second\": true }\n```";
      const result = extractJsonFromMarkdown(content);
      expect(result).toBe('{ "first": true }');
    });
  });

  describe("defaultParser", () => {
    it("should return structured_output when available", () => {
      const structuredOutput = { name: "test", value: 42 };
      const result = defaultParser("some text", structuredOutput, false);
      expect(result).toEqual(structuredOutput);
    });

    it("should parse JSON from content when structured_output is null", () => {
      const jsonContent = '{"name": "test", "value": 42}';
      const result = defaultParser<{ name: string; value: number }>(
        jsonContent,
        null,
        false,
      );
      expect(result).toEqual({ name: "test", value: 42 });
    });

    it("should parse JSON from markdown when extractFromMarkdown is true", () => {
      const markdownContent = '```json\n{"name": "test"}\n```';
      const result = defaultParser<{ name: string }>(markdownContent, undefined, true);
      expect(result).toEqual({ name: "test" });
    });

    it("should throw error when content is not valid JSON and no structured_output", () => {
      expect(() => {
        defaultParser("not valid json", undefined, false);
      }).toThrow("Agent response missing structured_output and content is not valid JSON");
    });

    it("should handle nested JSON objects", () => {
      const nestedJson = '{"user": {"name": "test", "settings": {"theme": "dark"}}}';
      const result = defaultParser<{ user: { name: string; settings: { theme: string } } }>(
        nestedJson,
        undefined,
        false,
      );
      expect(result.user.name).toBe("test");
      expect(result.user.settings.theme).toBe("dark");
    });
  });

  describe("getStructuredOutput", () => {
    let ctx: AgentChatServiceTestContext;

    beforeEach(() => {
      ctx = createMockContext();
    });

    it("should return structured output from agent response", async () => {
      const expectedOutput = { actorName: "John Doe", role: "protagonist" };
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-1",
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            structured_output: expectedOutput,
          },
        },
      });

      const result = await pipe(
        AgentChatService.getStructuredOutput({
          message: "Extract actor information",
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(result).toEqual(expectedOutput);
      expect(ctx.agent.Chat.Create).toHaveBeenCalledWith({
        Body: {
          message: "Extract actor information",
          conversation_id: null,
        },
      });
    });

    it("should parse content as JSON when structured_output is not available", async () => {
      const jsonContent = '{"actorName": "Jane Doe", "role": "antagonist"}';
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-2",
            role: "assistant",
            content: jsonContent,
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getStructuredOutput({
          message: "Extract actor information",
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(result).toEqual({ actorName: "Jane Doe", role: "antagonist" });
    });

    it("should extract JSON from markdown when extractFromMarkdown is true", async () => {
      const markdownContent = '```json\n{"actorName": "Bob Smith"}\n```';
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-3",
            role: "assistant",
            content: markdownContent,
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getStructuredOutput({
          message: "Extract actor",
          extractFromMarkdown: true,
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(result).toEqual({ actorName: "Bob Smith" });
    });

    it("should use custom parser when provided", async () => {
      const customParser = vi.fn().mockReturnValue({ custom: "parsed" });
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-4",
            role: "assistant",
            content: "raw content",
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getStructuredOutput({
          message: "Test",
          customParser,
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(customParser).toHaveBeenCalledWith("raw content", undefined);
      expect(result).toEqual({ custom: "parsed" });
    });

    it("should pass conversation_id when provided", async () => {
      const conversationId = "conv-123";
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-5",
            role: "assistant",
            content: '{"result": "ok"}',
            timestamp: new Date().toISOString(),
            structured_output: { result: "ok" },
          },
        },
      });

      await pipe(
        AgentChatService.getStructuredOutput({
          message: "Test",
          conversationId,
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(ctx.agent.Chat.Create).toHaveBeenCalledWith({
        Body: {
          message: "Test",
          conversation_id: conversationId,
        },
      });
    });

    it("should return Left when parsing fails", async () => {
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-6",
            role: "assistant",
            content: "not json and no structured output",
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getStructuredOutput({
          message: "Test",
        }),
        (fn) => fn(ctx as any),
        (task) => task(),
      );

      expect(fp.E.isLeft(result)).toBe(true);
    });
  });

  describe("getRawOutput", () => {
    let ctx: AgentChatServiceTestContext;

    beforeEach(() => {
      ctx = createMockContext();
    });

    it("should return raw content string from agent response", async () => {
      const rawContent = "This is the raw response from the agent";
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-7",
            role: "assistant",
            content: rawContent,
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getRawOutput({
          message: "Give me a summary",
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(result).toBe(rawContent);
    });

    it("should pass conversation_id to agent", async () => {
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-8",
            role: "assistant",
            content: "response",
            timestamp: new Date().toISOString(),
          },
        },
      });

      await pipe(
        AgentChatService.getRawOutput({
          message: "Test",
          conversationId: "conv-456",
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(ctx.agent.Chat.Create).toHaveBeenCalledWith({
        Body: {
          message: "Test",
          conversation_id: "conv-456",
        },
      });
    });

    it("should handle empty content", async () => {
      mockChatCreate(ctx, {
        data: {
          message: {
            id: "msg-9",
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
          },
        },
      });

      const result = await pipe(
        AgentChatService.getRawOutput({
          message: "Test",
        }),
        (fn) => fn(ctx as any),
        throwTE,
      );

      expect(result).toBe("");
    });
  });
});
