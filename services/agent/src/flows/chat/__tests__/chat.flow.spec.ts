import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AgentContext } from "../../../context/context.type.js";
import {
  deleteChatConversation,
  getChatConversation,
  listChatConversations,
  sendChatMessage,
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

    test("should yield error event when agent creation fails", async () => {
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.left(new Error("Provider unavailable"))),
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
        agent_type: "platform" as any,
      })(ctx)) {
        events.push(event);
      }

      expect(events[0].type).toBe("error");
      expect(events[0].error).toBe(
        "Failed to create agent with requested provider",
      );
    });

    test("should yield tool_call_end event for tool messages with tool_call_id", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [
                  {
                    tool_call_id: "tid-123",
                    name: "search_events",
                    content: "results here",
                  },
                ],
              ];
              yield ["messages", [{ content: "Based on results..." }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolEnd = events.find((e) => e.type === "tool_call_end");
      expect(toolEnd).toBeDefined();
      expect(toolEnd.tool_call.name).toBe("search_events");
      expect(toolEnd.tool_call.id).toBe("tid-123");
      expect(toolEnd.tool_call.result).toBe("results here");
    });

    test("should not yield tool_call_end when tool message has no name", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [{ tool_call_id: "tid-no-name", content: "result" }],
              ];
              yield ["messages", [{ content: "response" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolEndEvents = events.filter((e) => e.type === "tool_call_end");
      expect(toolEndEvents).toHaveLength(0);
    });

    test("should skip supervisor node messages", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [{ content: "platform" }, { langgraph_node: "supervisor" }],
              ];
              yield ["messages", [{ content: "Regular response" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const contentDeltas = events.filter((e) => e.type === "content_delta");
      expect(contentDeltas.every((e) => e.content !== "platform")).toBe(true);
      expect(contentDeltas.some((e) => e.content === "Regular response")).toBe(
        true,
      );
    });

    test("should handle think tags in content deltas", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [
                  {
                    content: "<think>internal reasoning</think>actual answer",
                  },
                ],
              ];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const thinkingDeltas = events.filter(
        (e) => e.type === "content_delta" && e.thinking === true,
      );
      const regularDeltas = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );

      expect(
        thinkingDeltas.some((e) => e.content === "internal reasoning"),
      ).toBe(true);
      expect(regularDeltas.some((e) => e.content === "actual answer")).toBe(
        true,
      );
    });

    test("should buffer content inside think block without closing tag in chunk", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [{ content: "<think>first chunk of thinking" }],
              ];
              yield [
                "messages",
                [{ content: " continued thinking</think>answer" }],
              ];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const thinkDeltas = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      const regularDeltas = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );

      const allThinkContent = thinkDeltas.map((e) => e.content).join("");
      expect(allThinkContent).toContain("first chunk of thinking");
      expect(regularDeltas.some((e) => e.content === "answer")).toBe(true);
    });

    test("should buffer partial think tag at chunk boundary", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield ["messages", [{ content: "prefix<thi" }]];
              yield ["messages", [{ content: "nk>thinking</think>suffix" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const thinkDeltas = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      const regularDeltas = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );

      expect(thinkDeltas.some((e) => e.content === "thinking")).toBe(true);
      expect(regularDeltas.some((e) => e.content === "prefix")).toBe(true);
      expect(regularDeltas.some((e) => e.content === "suffix")).toBe(true);
    });

    test("should yield tool_call_end for tool results in updates mode", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "updates",
                {
                  tools: {
                    messages: [
                      { name: "search_events", content: "results from search" },
                    ],
                  },
                },
              ];
              yield ["messages", [{ content: "Based on results..." }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolEnd = events.find(
        (e) =>
          e.type === "tool_call_end" && e.tool_call.name === "search_events",
      );
      expect(toolEnd).toBeDefined();
      expect(toolEnd.tool_call.result).toBe("results from search");
    });

    test("should stringify non-string tool content in updates mode", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "updates",
                {
                  tools: {
                    messages: [
                      {
                        name: "search",
                        content: [{ type: "result", data: "found" }],
                      },
                    ],
                  },
                },
              ];
              yield ["messages", [{ content: "done" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolEnd = events.find(
        (e) => e.type === "tool_call_end" && e.tool_call.name === "search",
      );
      expect(toolEnd).toBeDefined();
      expect(typeof toolEnd.tool_call.result).toBe("string");
    });

    test("should yield thinking content_delta for debug checkpoint with thinking", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "debug",
                {
                  type: "checkpoint",
                  values: {
                    messages: [
                      {
                        additional_kwargs: { thinking: "deep reasoning here" },
                      },
                    ],
                  },
                },
              ];
              yield ["messages", [{ content: "conclusion" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const thinkingDeltas = events.filter(
        (e) => e.type === "content_delta" && e.thinking === true,
      );
      expect(
        thinkingDeltas.some((e) => e.content === "deep reasoning here"),
      ).toBe(true);
    });

    test("should not emit thinking when debug checkpoint has no thinking kwargs", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "debug",
                {
                  type: "checkpoint",
                  values: {
                    messages: [{ additional_kwargs: {} }],
                  },
                },
              ];
              yield ["messages", [{ content: "normal response" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const thinkingDeltas = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      expect(thinkingDeltas).toHaveLength(0);
    });

    test("should include usedProvider in message_start and message_end when aiConfig is provided", async () => {
      const aiConfig = {
        provider: "anthropic" as const,
        model: "claude-sonnet-4-20250514" as const,
      };
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            stream: vi.fn().mockImplementation(function* () {
              yield ["messages", [{ content: "response" }]];
            }),
          }),
        ),
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
        aiConfig,
      })(ctx)) {
        events.push(event);
      }

      const startEvent = events.find((e) => e.type === "message_start");
      const endEvent = events.find((e) => e.type === "message_end");

      expect(startEvent?.usedProvider?.provider).toBe("anthropic");
      expect(startEvent?.usedProvider?.model).toBe("claude-sonnet-4-20250514");
      expect(endEvent?.usedProvider?.provider).toBe("anthropic");
    });

    test("should default model to gpt-4o in stream when aiConfig.model is undefined", async () => {
      const aiConfig = { provider: "openai" as const };
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            stream: vi.fn().mockImplementation(function* () {
              yield ["messages", [{ content: "response" }]];
            }),
          }),
        ),
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
        aiConfig,
      })(ctx)) {
        events.push(event);
      }

      const startEvent = events.find((e) => e.type === "message_start");
      expect(startEvent?.usedProvider?.model).toBe("gpt-4o");
    });

    test("should not yield duplicate tool_call_start for same tool call id", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [
                  {
                    tool_calls: [{ id: "dup-1", name: "tool_a", args: {} }],
                  },
                ],
              ];
              yield [
                "messages",
                [
                  {
                    tool_calls: [{ id: "dup-1", name: "tool_a", args: {} }],
                  },
                ],
              ];
              yield ["messages", [{ content: "done" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolCallStarts = events.filter(
        (e) => e.type === "tool_call_start" && e.tool_call.id === "dup-1",
      );
      expect(toolCallStarts).toHaveLength(1);
    });

    test("should handle tool call args as string", async () => {
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
                        id: "str-args-1",
                        name: "tool_b",
                        args: '{"key":"val"}',
                      },
                    ],
                  },
                ],
              ];
              yield ["messages", [{ content: "done" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolCallStart = events.find((e) => e.type === "tool_call_start");
      expect(toolCallStart?.tool_call.arguments).toBe('{"key":"val"}');
    });

    test("should generate uuid for tool call when id is missing", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [{ tool_calls: [{ name: "tool_c", args: {} }] }],
              ];
              yield ["messages", [{ content: "done" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const toolCallStart = events.find((e) => e.type === "tool_call_start");
      expect(toolCallStart?.tool_call.id).toBeDefined();
      expect(toolCallStart?.tool_call.id).toHaveLength(36);
    });

    test("should skip content accumulation for non-string message content", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            stream: vi.fn().mockImplementation(function* () {
              yield [
                "messages",
                [{ content: [{ type: "text", text: "obj content" }] }],
              ];
              yield ["messages", [{ content: "string content" }]];
            }),
          },
        } as any,
      });

      const events: any[] = [];
      for await (const event of sendChatMessageStream({
        message: "test",
        conversation_id: null,
      })(ctx)) {
        events.push(event);
      }

      const contentDeltas = events.filter((e) => e.type === "content_delta");
      expect(contentDeltas.some((e) => e.content === "string content")).toBe(
        true,
      );
      expect(contentDeltas.every((e) => typeof e.content === "string")).toBe(
        true,
      );
    });
  });

  describe("sendChatMessage with aiConfig", () => {
    test("should include usedProvider when aiConfig is provided", async () => {
      const aiConfig = {
        provider: "openai" as const,
        model: "gpt-4o" as const,
      };
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn().mockResolvedValue({
              messages: [{ id: "msg-456", content: "AI response" }],
            }),
            stream: vi.fn(),
          }),
        ),
      });

      const result = await pipe(
        sendChatMessage({
          message: "Hello with aiConfig",
          conversation_id: null,
          aiConfig,
        })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.usedProvider).toBeDefined();
        expect(result.right.usedProvider?.provider).toBe("openai");
        expect(result.right.usedProvider?.model).toBe("gpt-4o");
      }
    });

    test("should use model default 'gpt-4o' when aiConfig.model is undefined", async () => {
      const aiConfig = { provider: "openai" as const };
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn().mockResolvedValue({
              messages: [{ id: "msg-789", content: "response" }],
            }),
            stream: vi.fn(),
          }),
        ),
      });

      const result = await pipe(
        sendChatMessage({
          message: "test",
          conversation_id: null,
          aiConfig,
        })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.usedProvider?.model).toBe("gpt-4o");
      }
    });

    test("should handle non-string lastMessage content", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            invoke: vi.fn().mockResolvedValue({
              messages: [
                {
                  id: "msg-obj",
                  content: [{ type: "text", text: "object content" }],
                },
              ],
            }),
            stream: vi.fn(),
          },
        } as any,
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.message.content).toContain("object content");
      }
    });

    test("should use uuid for lastMessage.id when not present", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn(),
          agent: {
            invoke: vi.fn().mockResolvedValue({
              messages: [{ content: "response without id" }],
            }),
            stream: vi.fn(),
          },
        } as any,
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.message.id).toBeDefined();
        expect(result.right.message.id).toHaveLength(36);
      }
    });

    test("should enhance message with resource context using defaults when action and recordId are missing", async () => {
      const payload = {
        message: "Help me",
        conversation_id: null,
        resource_context: {
          resource: "events",
        } as any,
      };

      const result = await pipe(sendChatMessage(payload)(ctx))();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect((ctx.agent.agent as any).invoke).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.stringContaining("viewing events"),
            ]),
          }),
          expect.any(Object),
        );
      }
    });
  });
});
