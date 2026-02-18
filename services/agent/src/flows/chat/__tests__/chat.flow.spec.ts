import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AgentContext } from "../../../context/context.type.js";
import {
  sendChatMessage,
  getChatConversation,
  listChatConversations,
  deleteChatConversation,
  sendChatMessageStream,
} from "../chat.flow.js";

/**
 * Unit tests for chat.flow.ts
 *
 * These tests mock the agent context and verify the flow logic
 * for chat message handling, conversation management, and streaming.
 */

const createMockContext = (overrides?: Partial<AgentContext>): AgentContext => {
  const logger = GetLogger("test-chat-flow");

  return {
    env: {
      NODE_ENV: "test",
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium",
      JWT_SECRET: "test-secret",
      MCP_AUTH_URL: "http://localhost:4000",
    } as any,
    logger,
    jwt: {} as any,
    http: {} as any,
    puppeteer: {} as any,
    langchain: {} as any,
    agentFactory: vi.fn().mockReturnValue(
      TE.right({
        invoke: vi.fn().mockResolvedValue({
          messages: [
            {
              id: "msg-123",
              content: "This is a test response",
            },
          ],
        }),
        stream: vi.fn().mockImplementation(function* () {
          yield [
            "messages",
            [
              {
                content: "Test streaming response",
              },
            ],
          ];
        }),
      }),
    ),
    fs: {
      getObject: vi.fn().mockReturnValue(TE.right("# Mock AGENTS.md")),
    } as any,
    agent: {
      invoke: vi.fn().mockReturnValue(
        TE.right({
          messages: [
            {
              id: "msg-123",
              content: "This is a test response",
            },
          ],
        }),
      ),
      agent: {
        invoke: vi.fn().mockResolvedValue({
          messages: [
            {
              id: "msg-123",
              content: "This is a test response",
            },
          ],
        }),
        stream: vi.fn().mockImplementation(function* () {
          yield [
            "messages",
            [
              {
                content: "Test streaming response",
              },
            ],
          ];
        }),
      },
    } as any,
    ...overrides,
  };
};

describe("chat.flow", () => {
  let ctx: AgentContext;

  beforeEach(() => {
    ctx = createMockContext();
    vi.clearAllMocks();
  });

  describe("sendChatMessage", () => {
    test("should create a new conversation when conversation_id is null", async () => {
      const payload = {
        message: "Hello, world!",
        conversation_id: null,
      };

      const result = await pipe(sendChatMessage(payload)(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.conversationId).toBeDefined();
        expect(result.right.conversationId).toHaveLength(36); // UUID length
        expect(result.right.message.role).toBe("assistant");
        expect(result.right.message.content).toBe("This is a test response");
      }
    });

    test("should use existing conversation_id when provided", async () => {
      const existingConversationId = "existing-conv-123";
      const payload = {
        message: "Continue conversation",
        conversation_id: existingConversationId,
      };

      const result = await pipe(sendChatMessage(payload)(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.conversationId).toBe(existingConversationId);
      }
    });

    test("should enhance message with resource context when provided", async () => {
      const payload = {
        message: "Help me edit this",
        conversation_id: null,
        resource_context: {
          resource: "actors",
          recordId: "actor-123",
          action: "edit",
        },
      };

      await pipe(sendChatMessage(payload)(ctx))();

      expect((ctx.agent.agent as any).invoke).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.stringContaining("Help me edit this"),
          ]),
        }),
        expect.any(Object),
      );
    });

    test("should handle agent invoke error", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn().mockReturnValue(TE.left(new Error("Agent error"))),
          agent: {} as any,
        } as any,
      });

      const payload = {
        message: "Test message",
        conversation_id: null,
      };

      const result = await pipe(sendChatMessage(payload)(ctx))();

      expect(result._tag).toBe("Left");
    });

    test("should store messages in conversation", async () => {
      const payload = {
        message: "First message",
        conversation_id: null,
      };

      const result = await pipe(sendChatMessage(payload)(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        const conversationId = result.right.conversationId;

        // Verify conversation was stored
        const conversationResult = await pipe(
          getChatConversation(conversationId)(ctx),
        )();

        expect(conversationResult._tag).toBe("Right");
        if (conversationResult._tag === "Right") {
          expect(conversationResult.right).toHaveLength(2); // user + assistant
          expect(conversationResult.right[0].role).toBe("user");
          expect(conversationResult.right[0].content).toBe("First message");
          expect(conversationResult.right[1].role).toBe("assistant");
        }
      }
    });
  });

  describe("getChatConversation", () => {
    test("should return empty array for non-existent conversation", async () => {
      const result = await pipe(getChatConversation("non-existent-id")(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toEqual([]);
      }
    });

    test("should return messages for existing conversation", async () => {
      // First create a conversation
      const createResult = await pipe(
        sendChatMessage({
          message: "Test message",
          conversation_id: null,
        })(ctx),
      )();

      expect(createResult._tag).toBe("Right");
      if (createResult._tag === "Right") {
        const conversationId = createResult.right.conversationId;

        const result = await pipe(getChatConversation(conversationId)(ctx))();

        expect(result._tag).toBe("Right");
        if (result._tag === "Right") {
          expect(result.right.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("listChatConversations", () => {
    test("should return list of conversations", async () => {
      // Create a conversation first
      await pipe(
        sendChatMessage({
          message: "Test message",
          conversation_id: null,
        })(ctx),
      )();

      const result = await pipe(listChatConversations({})(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.total).toBeGreaterThan(0);
        expect(result.right.data.length).toBeGreaterThan(0);
        expect(result.right.data[0]).toHaveProperty("id");
        expect(result.right.data[0]).toHaveProperty("messages");
        expect(result.right.data[0]).toHaveProperty("created_at");
        expect(result.right.data[0]).toHaveProperty("updated_at");
      }
    });
  });

  describe("deleteChatConversation", () => {
    test("should return false for non-existent conversation", async () => {
      const result = await pipe(
        deleteChatConversation("non-existent-id")(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBe(false);
      }
    });

    test("should delete existing conversation", async () => {
      // Create a conversation first
      const createResult = await pipe(
        sendChatMessage({
          message: "Test message",
          conversation_id: null,
        })(ctx),
      )();

      expect(createResult._tag).toBe("Right");
      if (createResult._tag === "Right") {
        const conversationId = createResult.right.conversationId;

        // Delete the conversation
        const deleteResult = await pipe(
          deleteChatConversation(conversationId)(ctx),
        )();

        expect(deleteResult._tag).toBe("Right");
        if (deleteResult._tag === "Right") {
          expect(deleteResult.right).toBe(true);
        }

        // Verify it's gone
        const getResult = await pipe(
          getChatConversation(conversationId)(ctx),
        )();

        expect(getResult._tag).toBe("Right");
        if (getResult._tag === "Right") {
          expect(getResult.right).toEqual([]);
        }
      }
    });
  });

  describe("sendChatMessageStream", () => {
    test("should yield message_start event first", async () => {
      const payload = {
        message: "Stream test",
        conversation_id: null,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
        if (events.length >= 1) break; // Just get first event
      }

      expect(events[0].type).toBe("message_start");
      expect(events[0].role).toBe("assistant");
      expect(events[0].message_id).toBeDefined();
      expect(events[0].timestamp).toBeDefined();
    });

    test("should yield content_delta events for content", async () => {
      const payload = {
        message: "Stream test",
        conversation_id: null,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      const contentDeltas = events.filter((e) => e.type === "content_delta");
      expect(contentDeltas.length).toBeGreaterThan(0);
      expect(contentDeltas[0].content).toBeDefined();
    });

    test("should yield message_end event at the end", async () => {
      const payload = {
        message: "Stream test",
        conversation_id: null,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe("message_end");
      expect(lastEvent.message_id).toBeDefined();
    });

    test("should use provided conversation_id", async () => {
      const existingConversationId = "stream-conv-123";
      const payload = {
        message: "Stream test",
        conversation_id: existingConversationId,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      // Verify conversation was stored with correct ID
      const result = await pipe(
        getChatConversation(existingConversationId)(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.length).toBeGreaterThan(0);
      }
    });

    test("should yield error event on stream error", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            // eslint-disable-next-line require-yield
            stream: vi.fn().mockImplementation(function* () {
              throw new Error("Stream error");
            }),
          },
        } as any,
      });

      const payload = {
        message: "Error test",
        conversation_id: null,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      const errorEvent = events.find((e) => e.type === "error");
      expect(errorEvent).toBeDefined();
      expect(errorEvent?.error).toContain("Stream error");
    });

    test("should yield tool_call_start events for tool calls", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [
                  {
                    tool_calls: [
                      {
                        id: "tool-1",
                        name: "search_events",
                        args: { query: "test" },
                      },
                    ],
                  },
                ],
              ];
              yield [
                "messages",
                [
                  {
                    content: "Based on the search results...",
                  },
                ],
              ];
            }),
          },
        } as any,
      });

      const payload = {
        message: "Search for events",
        conversation_id: null,
      };

      const generator = sendChatMessageStream(payload)(ctx);
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      const toolCallStart = events.find((e) => e.type === "tool_call_start");
      expect(toolCallStart).toBeDefined();
      expect(toolCallStart?.tool_call.name).toBe("search_events");
    });
  });
});
