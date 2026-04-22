import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AgentContext } from "../../../context/context.type.js";
import {
  buildEnhancedMessage,
  deleteChatConversation,
  emptyThinkState,
  getChatConversation,
  isSupervisorEvent,
  listChatConversations,
  parseThinkContent,
  processStreamEvent,
  sendChatMessage,
  sendChatMessageStream,
  trailingPartialTag,
} from "../chat.flow.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal on_chat_model_stream event. */
const chatModelEvent = (
  content: string,
  opts: {
    supervisorNode?: boolean;
    usageMeta?: { input_tokens: number; output_tokens: number };
  } = {},
) => ({
  event: "on_chat_model_stream" as const,
  run_id: "run-chat",
  name: "ChatOpenAI",
  data: {
    chunk: {
      content,
      ...(opts.usageMeta ? { usage_metadata: opts.usageMeta } : {}),
    },
  },
  metadata: opts.supervisorNode
    ? { langgraph_node: "supervisor" }
    : { langgraph_node: "platform" },
});

/** Build a minimal on_tool_start event. */
const toolStartEvent = (
  name: string,
  input: Record<string, unknown>,
  runId = "run-tool-1",
) => ({
  event: "on_tool_start" as const,
  run_id: runId,
  name,
  data: { input },
  metadata: {},
});

/** Build a minimal on_tool_end event. */
const toolEndEvent = (name: string, output: unknown, runId = "run-tool-1") => ({
  event: "on_tool_end" as const,
  run_id: runId,
  name,
  data: { output },
  metadata: {},
});

/** Create an async generator from an array of events. */
function* asyncEvents<T>(items: T[]): Generator<T> {
  for (const item of items) yield item;
}

// ---------------------------------------------------------------------------
// Mock context
// ---------------------------------------------------------------------------

const createMockContext = (overrides?: Partial<AgentContext>): AgentContext => {
  const logger = GetLogger("test-chat-flow");

  const defaultAgent = {
    invoke: vi.fn().mockResolvedValue({
      messages: [{ id: "msg-123", content: "This is a test response" }],
    }),
    streamEvents: vi
      .fn()
      .mockImplementation(() =>
        asyncEvents([chatModelEvent("Test streaming response")]),
      ),
  };

  return {
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
    } as any,
    logger,
    jwt: {} as any,
    http: {} as any,
    puppeteer: {} as any,
    langchain: {} as any,
    agentFactory: vi.fn().mockReturnValue(
      TE.right({
        invoke: vi.fn().mockResolvedValue({
          messages: [{ id: "msg-factory", content: "Factory response" }],
        }),
        streamEvents: vi
          .fn()
          .mockImplementation(() =>
            asyncEvents([chatModelEvent("Factory stream response")]),
          ),
      }),
    ),
    fs: {
      getObject: vi.fn().mockReturnValue(TE.right("# Mock AGENTS.md")),
    } as any,
    agent: {
      invoke: vi
        .fn()
        .mockReturnValue(
          TE.right({ messages: [{ id: "msg-123", content: "Test response" }] }),
        ),
      agent: defaultAgent,
    } as any,
    ...overrides,
  };
};

// ---------------------------------------------------------------------------
// Pure function unit tests
// ---------------------------------------------------------------------------

describe("buildEnhancedMessage", () => {
  test("returns message unchanged when no resource_context", () => {
    expect(buildEnhancedMessage("hello")).toBe("hello");
  });

  test("appends context block with resource and recordId", () => {
    const result = buildEnhancedMessage("edit this", {
      resource: "actors",
      recordId: "actor-1",
      action: "edit",
    });
    expect(result).toContain("edit this");
    expect(result).toContain("edit actors");
    expect(result).toContain("actor-1");
  });

  test("defaults action to 'viewing' when not provided", () => {
    const result = buildEnhancedMessage("view this", {
      resource: "events",
      recordId: null,
    });
    expect(result).toContain("viewing events");
  });

  test("omits id part when recordId is null", () => {
    const result = buildEnhancedMessage("browse", {
      resource: "groups",
      action: "listing",
      recordId: null,
    });
    expect(result).not.toContain("with ID");
  });
});

describe("trailingPartialTag", () => {
  test("returns 0 for text with no partial <think> suffix", () => {
    expect(trailingPartialTag("hello world")).toBe(0);
  });

  test("returns 1 for text ending with '<'", () => {
    expect(trailingPartialTag("hello<")).toBe(1);
  });

  test("returns 6 for text ending with '<think'", () => {
    expect(trailingPartialTag("hello<think")).toBe(6);
  });

  test("returns 0 for complete <think> tag (no partial)", () => {
    // A complete tag is not a partial — no buffering needed
    expect(trailingPartialTag("hello<think>")).toBe(0);
  });
});

describe("isSupervisorEvent", () => {
  test("returns true when langgraph_node is supervisor", () => {
    expect(
      isSupervisorEvent({ metadata: { langgraph_node: "supervisor" } }),
    ).toBe(true);
  });

  test("returns false for other nodes", () => {
    expect(
      isSupervisorEvent({ metadata: { langgraph_node: "platform" } }),
    ).toBe(false);
  });

  test("returns false when metadata is absent", () => {
    expect(isSupervisorEvent({})).toBe(false);
  });
});

describe("parseThinkContent", () => {
  const id = "msg-1";

  test("emits a regular content_delta for plain text", () => {
    const [events, state] = parseThinkContent("hello", emptyThinkState(), id);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "content_delta",
      content: "hello",
      message_id: id,
    });
    expect((events[0] as any).thinking).toBeUndefined();
    expect(state.inside).toBe(false);
  });

  test("splits text at <think> into regular + thinking deltas", () => {
    const [events] = parseThinkContent(
      "before<think>thought</think>after",
      emptyThinkState(),
      id,
    );
    const regular = events.filter((e) => !e.thinking);
    const thinking = events.filter((e) => e.thinking);
    expect(regular.map((e) => e.content).join("")).toContain("before");
    expect(regular.map((e) => e.content).join("")).toContain("after");
    expect(thinking.map((e) => e.content).join("")).toContain("thought");
  });

  test("buffers content when inside think block spans chunks", () => {
    const [, midState] = parseThinkContent(
      "<think>first",
      emptyThinkState(),
      id,
    );
    expect(midState.inside).toBe(true);

    const [events, finalState] = parseThinkContent(
      " second</think>end",
      midState,
      id,
    );
    const thinking = events.filter((e) => e.thinking);
    const regular = events.filter((e) => !e.thinking);
    expect(thinking.map((e) => e.content).join("")).toContain("first second");
    expect(regular.some((e) => e.content === "end")).toBe(true);
    expect(finalState.inside).toBe(false);
  });

  test("buffers partial <think> tag at chunk boundary", () => {
    const [events1, state1] = parseThinkContent(
      "prefix<thi",
      emptyThinkState(),
      id,
    );
    // "prefix" should be emitted, "<thi" buffered
    expect(events1.some((e) => e.content === "prefix")).toBe(true);
    expect(state1.buffer).toContain("<thi");

    const [events2] = parseThinkContent(
      "nk>thinking</think>suffix",
      state1,
      id,
    );
    const thinking = events2.filter((e) => e.thinking);
    const regular = events2.filter((e) => !e.thinking);
    expect(thinking.some((e) => e.content === "thinking")).toBe(true);
    expect(regular.some((e) => e.content === "suffix")).toBe(true);
  });
});

describe("processStreamEvent", () => {
  const state = () => ({
    contentAccumulator: "",
    tokens: { promptTokens: 0, completionTokens: 0 },
    think: emptyThinkState(),
  });

  test("on_chat_model_stream emits content_delta for string content", () => {
    const event = chatModelEvent("hello");
    const [events, nextState] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("content_delta");
    expect(events[0].content).toBe("hello");
    expect(nextState.contentAccumulator).toBe("hello");
  });

  test("on_chat_model_stream skips supervisor events", () => {
    const event = chatModelEvent("platform", { supervisorNode: true });
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(0);
  });

  test("on_chat_model_stream accumulates token usage", () => {
    const event = chatModelEvent("hi", {
      usageMeta: { input_tokens: 10, output_tokens: 5 },
    });
    const [, nextState] = processStreamEvent(event, state(), "msg-1");
    expect(nextState.tokens.promptTokens).toBe(10);
    expect(nextState.tokens.completionTokens).toBe(5);
  });

  test("on_chat_model_stream ignores empty string content", () => {
    const event = chatModelEvent("");
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(0);
  });

  test("on_tool_start emits tool_call_start with serialized input", () => {
    const event = toolStartEvent("liexp_cli", {
      command: "actor list --_start 0",
    });
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_call_start");
    expect(events[0].tool_call?.name).toBe("liexp_cli");
    expect(events[0].tool_call?.id).toBe("run-tool-1");
    expect(events[0].tool_call?.arguments).toContain("actor list");
  });

  test("on_tool_end emits tool_call_end with string output", () => {
    const event = toolEndEvent("liexp_cli", "actor results here");
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_call_end");
    expect(events[0].tool_call?.result).toBe("actor results here");
  });

  test("on_tool_end serializes non-string output", () => {
    const event = toolEndEvent("liexp_cli", [{ id: "1", name: "Actor A" }]);
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(typeof events[0].tool_call?.result).toBe("string");
    expect(events[0].tool_call?.result).toContain("Actor A");
  });

  test("unknown events produce no output", () => {
    const event = {
      event: "on_chain_start",
      run_id: "r",
      name: "foo",
      data: {},
      metadata: {},
    };
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Integration tests via sendChatMessage / sendChatMessageStream
// ---------------------------------------------------------------------------

describe("chat.flow", () => {
  let ctx: AgentContext;

  beforeEach(() => {
    ctx = createMockContext();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // sendChatMessage
  // -------------------------------------------------------------------------

  describe("sendChatMessage", () => {
    test("creates a new conversation UUID when conversation_id is null", async () => {
      const result = await pipe(
        sendChatMessage({ message: "Hello", conversation_id: null })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.conversationId).toHaveLength(36);
        expect(result.right.message.role).toBe("assistant");
        expect(result.right.message.content).toBe("This is a test response");
      }
    });

    test("preserves provided conversation_id", async () => {
      const result = await pipe(
        sendChatMessage({ message: "Continue", conversation_id: "conv-abc" })(
          ctx,
        ),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.conversationId).toBe("conv-abc");
      }
    });

    test("returns Left when agent invoke fails", async () => {
      ctx = createMockContext({
        agent: {
          invoke: vi.fn().mockReturnValue(TE.left(new Error("Agent error"))),
          agent: {
            invoke: vi.fn().mockRejectedValue(new Error("Agent error")),
          } as any,
        } as any,
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();
      expect(result._tag).toBe("Left");
    });

    test("stores user + assistant message in conversation", async () => {
      const sendResult = await pipe(
        sendChatMessage({ message: "First message", conversation_id: null })(
          ctx,
        ),
      )();

      expect(sendResult._tag).toBe("Right");
      if (sendResult._tag === "Right") {
        const convResult = await pipe(
          getChatConversation(sendResult.right.conversationId)(ctx),
        )();
        expect(convResult._tag).toBe("Right");
        if (convResult._tag === "Right") {
          expect(convResult.right).toHaveLength(2);
          expect(convResult.right[0].role).toBe("user");
          expect(convResult.right[0].content).toBe("First message");
          expect(convResult.right[1].role).toBe("assistant");
        }
      }
    });

    test("includes usedProvider when aiConfig is provided", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn().mockResolvedValue({
              messages: [{ id: "msg-456", content: "AI response" }],
            }),
            streamEvents: vi.fn(),
          }),
        ),
      });

      const result = await pipe(
        sendChatMessage({
          message: "Hello",
          conversation_id: null,
          aiConfig: { provider: "openai", model: "gpt-4o" },
        })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.usedProvider?.provider).toBe("openai");
        expect(result.right.usedProvider?.model).toBe("gpt-4o");
      }
    });

    test("defaults model to gpt-4o when aiConfig.model is missing", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi
              .fn()
              .mockResolvedValue({ messages: [{ id: "m", content: "ok" }] }),
            streamEvents: vi.fn(),
          }),
        ),
      });

      const result = await pipe(
        sendChatMessage({
          message: "test",
          conversation_id: null,
          aiConfig: { provider: "openai" } as any,
        })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.usedProvider?.model).toBe("gpt-4o");
      }
    });
  });

  // -------------------------------------------------------------------------
  // getChatConversation / listChatConversations / deleteChatConversation
  // -------------------------------------------------------------------------

  describe("getChatConversation", () => {
    test("returns empty array for unknown conversation", async () => {
      const result = await pipe(getChatConversation("nonexistent")(ctx))();
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") expect(result.right).toEqual([]);
    });

    test("returns stored messages for existing conversation", async () => {
      const send = await pipe(
        sendChatMessage({ message: "Hi", conversation_id: null })(ctx),
      )();
      expect(send._tag).toBe("Right");
      if (send._tag === "Right") {
        const get = await pipe(
          getChatConversation(send.right.conversationId)(ctx),
        )();
        expect(get._tag).toBe("Right");
        if (get._tag === "Right") expect(get.right.length).toBeGreaterThan(0);
      }
    });
  });

  describe("listChatConversations", () => {
    test("returns all conversations with metadata", async () => {
      await pipe(
        sendChatMessage({ message: "List test", conversation_id: null })(ctx),
      )();

      const result = await pipe(listChatConversations({})(ctx))();
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.total).toBeGreaterThan(0);
        expect(result.right.data[0]).toHaveProperty("id");
        expect(result.right.data[0]).toHaveProperty("messages");
        expect(result.right.data[0]).toHaveProperty("created_at");
        expect(result.right.data[0]).toHaveProperty("updated_at");
      }
    });
  });

  describe("deleteChatConversation", () => {
    test("returns false for non-existent conversation", async () => {
      const result = await pipe(deleteChatConversation("ghost")(ctx))();
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") expect(result.right).toBe(false);
    });

    test("deletes existing conversation and clears it", async () => {
      const send = await pipe(
        sendChatMessage({ message: "To delete", conversation_id: null })(ctx),
      )();
      expect(send._tag).toBe("Right");
      if (send._tag === "Right") {
        const convId = send.right.conversationId;

        const del = await pipe(deleteChatConversation(convId)(ctx))();
        expect(del._tag).toBe("Right");
        if (del._tag === "Right") expect(del.right).toBe(true);

        const get = await pipe(getChatConversation(convId)(ctx))();
        expect(get._tag).toBe("Right");
        if (get._tag === "Right") expect(get.right).toEqual([]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // sendChatMessageStream
  // -------------------------------------------------------------------------

  describe("sendChatMessageStream", () => {
    const collect = async (
      ctx: AgentContext,
      msg = "test",
      conversationId: string | null = null,
    ) => {
      const events: any[] = [];
      for await (const e of sendChatMessageStream({
        message: msg,
        conversation_id: conversationId,
      })(ctx)) {
        events.push(e);
      }
      return events;
    };

    test("first event is message_start with role assistant", async () => {
      const events = await collect(ctx);
      expect(events[0].type).toBe("message_start");
      expect(events[0].role).toBe("assistant");
      expect(events[0].message_id).toBeDefined();
    });

    test("last event is message_end with content", async () => {
      const events = await collect(ctx);
      const last = events[events.length - 1];
      expect(last.type).toBe("message_end");
      expect(last.message_id).toBeDefined();
      expect(last.content).toBeDefined();
    });

    test("emits content_delta for on_chat_model_stream events", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("Hello "),
                  chatModelEvent("world"),
                ]),
              ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const deltas = events.filter((e) => e.type === "content_delta");
      expect(deltas.some((e) => e.content === "Hello ")).toBe(true);
      expect(deltas.some((e) => e.content === "world")).toBe(true);
    });

    test("supervisor node events are not emitted as content_delta", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("platform", { supervisorNode: true }),
                  chatModelEvent("Real answer"),
                ]),
              ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const deltas = events.filter((e) => e.type === "content_delta");
      expect(deltas.every((e) => e.content !== "platform")).toBe(true);
      expect(deltas.some((e) => e.content === "Real answer")).toBe(true);
    });

    test("on_tool_start emits tool_call_start with arguments", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(() =>
              asyncEvents([
                toolStartEvent("liexp_cli", {
                  command: "actor list --_start 0",
                }),
                chatModelEvent("Here are the actors."),
              ]),
            ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const toolStart = events.find((e) => e.type === "tool_call_start");
      expect(toolStart).toBeDefined();
      expect(toolStart.tool_call.name).toBe("liexp_cli");
      expect(toolStart.tool_call.arguments).toContain("actor list");
    });

    test("on_tool_end emits tool_call_end with result", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  toolStartEvent("liexp_cli", { command: "actor get 123" }),
                  toolEndEvent(
                    "liexp_cli",
                    JSON.stringify({ id: "123", fullName: "Test" }),
                  ),
                  chatModelEvent("Found the actor."),
                ]),
              ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const toolEnd = events.find((e) => e.type === "tool_call_end");
      expect(toolEnd).toBeDefined();
      expect(toolEnd.tool_call.name).toBe("liexp_cli");
      expect(toolEnd.tool_call.result).toContain("Test");
    });

    test("think tags produce thinking content_delta events", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent(
                    "<think>internal reasoning</think>actual answer",
                  ),
                ]),
              ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const thinking = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      const regular = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );
      expect(thinking.some((e) => e.content === "internal reasoning")).toBe(
        true,
      );
      expect(regular.some((e) => e.content === "actual answer")).toBe(true);
    });

    test("think tags spanning chunks are parsed correctly", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("<think>first chunk"),
                  chatModelEvent(" second chunk</think>conclusion"),
                ]),
              ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const thinking = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      const regular = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );
      const thinkText = thinking.map((e: any) => e.content).join("");
      expect(thinkText).toContain("first chunk");
      expect(thinkText).toContain("second chunk");
      expect(regular.some((e: any) => e.content === "conclusion")).toBe(true);
    });

    test("token usage from usage_metadata is reflected in message_end", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(() =>
              asyncEvents([
                chatModelEvent("response", {
                  usageMeta: { input_tokens: 20, output_tokens: 10 },
                }),
              ]),
            ),
          },
        } as any,
      });

      const events = await collect(ctx);
      const end = events.find((e) => e.type === "message_end");
      expect(end?.usage?.prompt_tokens).toBe(20);
      expect(end?.usage?.completion_tokens).toBe(10);
      expect(end?.usage?.total_tokens).toBe(30);
    });

    test("yields error event when agent factory fails", async () => {
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.left(new Error("Provider unavailable"))),
      });

      const events: any[] = [];
      for await (const e of sendChatMessageStream({
        message: "test",
        conversation_id: null,
        agent_type: "platform",
      })(ctx)) {
        events.push(e);
      }

      expect(events[0].type).toBe("error");
      expect(events[0].error).toBe(
        "Failed to create agent with requested provider",
      );
    });

    test("yields error event when streamEvents throws", async () => {
      ctx = createMockContext({
        agent: {
          agent: {
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(function* () {
              yield;
              throw new Error("Stream error");
            }),
          },
        } as any,
      });

      const events = await collect(ctx);
      const errorEvent = events.find((e) => e.type === "error");
      expect(errorEvent).toBeDefined();
      expect(errorEvent.error).toContain("Stream error");
    });

    test("uses provided conversation_id and stores messages", async () => {
      const events = await collect(ctx, "stream msg", "conv-stream-123");

      expect(events[0].type).toBe("message_start");

      const get = await pipe(getChatConversation("conv-stream-123")(ctx))();
      expect(get._tag).toBe("Right");
      if (get._tag === "Right") expect(get.right.length).toBeGreaterThan(0);
    });

    test("message_start and message_end include usedProvider when aiConfig is given", async () => {
      const events: any[] = [];
      for await (const e of sendChatMessageStream({
        message: "test",
        conversation_id: null,
        aiConfig: { provider: "anthropic", model: "claude-sonnet-4-20250514" },
      })(ctx)) {
        events.push(e);
      }

      const start = events.find((e) => e.type === "message_start");
      const end = events.find((e) => e.type === "message_end");
      expect(start?.usedProvider?.provider).toBe("anthropic");
      expect(start?.usedProvider?.model).toBe("claude-sonnet-4-20250514");
      expect(end?.usedProvider?.provider).toBe("anthropic");
    });
  });
});
