import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createFakeDb } from "../../../../test/fakeDb.js";
import { type AgentContext } from "../../../context/context.type.js";
import {
  buildEnhancedMessage,
  deleteChatConversation,
  describeModelEnd,
  emptyThinkState,
  getChatConversation,
  isSupervisorEvent,
  listChatConversations,
  parseThinkContent,
  processStreamEvent,
  sendChatMessage,
  sendChatMessageStream,
  totalTokens,
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

  return {
    env: {} as unknown,
    logger,
    jwt: {} as unknown,
    http: {} as unknown,
    puppeteer: {} as unknown,
    langchain: {} as unknown,
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
    fs: {} as unknown,
    db: createFakeDb() as unknown,
    ...overrides,
  };
};

/** recordTurn persists fire-and-forget; let the microtask queue drain. */
const flushPersistence = () => new Promise((r) => setTimeout(r, 0));

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
    expect((events[0] as { thinking?: unknown }).thinking).toBeUndefined();
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
    reasoningAccumulator: "",
    tokens: { promptTokens: 0, completionTokens: 0 },
    completedTokens: { promptTokens: 0, completionTokens: 0 },
    think: emptyThinkState(),
    sawStreamDelta: false,
  });

  test("reasoning-only chunk is emitted as a thinking delta, not content", () => {
    const event = {
      ...chatModelEvent(""),
      data: { chunk: { content: "", reasoning: "pondering" } },
    };
    const [events, nextState] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].thinking).toBe(true);
    expect(events[0].content).toBe("pondering");
    expect(nextState.contentAccumulator).toBe("");
    expect(nextState.reasoningAccumulator).toBe("pondering");
  });

  test("on_chat_model_end commits usage so successive model calls add up", () => {
    const end = (input_tokens: number, output_tokens: number) => ({
      event: "on_chat_model_end",
      run_id: "r",
      data: {
        output: {
          content: "",
          usage_metadata: { input_tokens, output_tokens },
        },
      },
      metadata: {},
    });
    const [, s1] = processStreamEvent(end(10, 5), state(), "m");
    const [, s2] = processStreamEvent(end(20, 7), s1, "m");
    expect(totalTokens(s2)).toEqual({ promptTokens: 30, completionTokens: 12 });
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
    const event = toolStartEvent("findActors", {
      fullName: "Test Actor",
    });
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_call_start");
    expect(events[0].tool_call?.name).toBe("findActors");
    expect(events[0].tool_call?.id).toBe("run-tool-1");
    expect(events[0].tool_call?.arguments).toContain("Test Actor");
  });

  test("on_tool_end emits tool_call_end with string output", () => {
    const event = toolEndEvent("findActors", "actor results here");
    const [events] = processStreamEvent(event, state(), "msg-1");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_call_end");
    expect(events[0].tool_call?.result).toBe("actor results here");
  });

  test("on_tool_end serializes non-string output", () => {
    const event = toolEndEvent("findActors", [{ id: "1", name: "Actor A" }]);
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
        expect(result.right.message.content).toBe("Factory response");
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
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn().mockRejectedValue(new Error("Agent error")),
            streamEvents: vi.fn(),
          }),
        ),
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();
      expect(result._tag).toBe("Left");
    });

    test("stores user + assistant message in conversation", async () => {
      const sendResult = await pipe(
        sendChatMessage({
          message: "First message",
          conversation_id: null,
          userId: "u1",
        })(ctx),
      )();

      expect(sendResult._tag).toBe("Right");
      if (sendResult._tag === "Right") {
        await flushPersistence();
        const convResult = await pipe(
          getChatConversation("u1", sendResult.right.conversationId)(ctx),
        )();
        expect(convResult._tag).toBe("Right");
        if (convResult._tag === "Right" && O.isSome(convResult.right)) {
          const { messages } = convResult.right.value;
          expect(messages).toHaveLength(2);
          expect(messages[0].role).toBe("user");
          expect(messages[0].content).toBe("First message");
          expect(messages[1].role).toBe("assistant");
        } else {
          throw new Error("conversation not persisted");
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

    test("defaults model to the configured LOCALAI_MODEL when aiConfig.model is missing", async () => {
      ctx = createMockContext({
        env: { LOCALAI_MODEL: "rhino-coder" } as unknown as AgentContext["env"],
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
          aiConfig: { provider: "openai" } as Record<string, unknown>,
        })(ctx),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.usedProvider?.model).toBe("rhino-coder");
      }
    });

    test("retries and succeeds when agent.invoke hits the empty-choices crash", async () => {
      const emptyChoicesError = new TypeError(
        "Cannot read properties of undefined (reading 'message')",
      );
      const invoke = vi
        .fn()
        .mockRejectedValueOnce(emptyChoicesError)
        .mockRejectedValueOnce(emptyChoicesError)
        .mockResolvedValueOnce({
          messages: [{ id: "msg-retry", content: "Recovered response" }],
        });
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke, streamEvents: vi.fn() })),
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(invoke).toHaveBeenCalledTimes(3);
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.message.content).toBe("Recovered response");
      }
    });

    test("retries when the error is re-wrapped and no longer instanceof TypeError", async () => {
      // langgraph's _runWithRetry/PregelRunner layers between the crash site
      // and agent.invoke() can re-wrap the original TypeError, dropping the
      // exact class while preserving the message — reproduces the prod case
      // where matching on `instanceof TypeError` silently stopped retrying.
      class WrappedError extends Error {}
      const wrapped = new WrappedError(
        "Cannot read properties of undefined (reading 'message')",
      );
      const invoke = vi
        .fn()
        .mockRejectedValueOnce(wrapped)
        .mockResolvedValueOnce({
          messages: [{ id: "msg-retry-2", content: "Recovered response 2" }],
        });
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke, streamEvents: vi.fn() })),
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(invoke).toHaveBeenCalledTimes(2);
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.message.content).toBe("Recovered response 2");
      }
    });

    test("gives up after exhausting retries on the empty-choices crash", async () => {
      const emptyChoicesError = new TypeError(
        "Cannot read properties of undefined (reading 'message')",
      );
      const invoke = vi.fn().mockRejectedValue(emptyChoicesError);
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke, streamEvents: vi.fn() })),
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(invoke).toHaveBeenCalledTimes(3);
      expect(result._tag).toBe("Left");
    });

    test("does not retry other errors from agent.invoke", async () => {
      const invoke = vi.fn().mockRejectedValue(new Error("Agent error"));
      ctx = createMockContext({
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke, streamEvents: vi.fn() })),
      });

      const result = await pipe(
        sendChatMessage({ message: "test", conversation_id: null })(ctx),
      )();

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(result._tag).toBe("Left");
    });
  });

  // -------------------------------------------------------------------------
  // getChatConversation / listChatConversations / deleteChatConversation
  // -------------------------------------------------------------------------

  describe("conversation persistence", () => {
    const send = async (message: string, userId: string, id?: string) => {
      const r = await pipe(
        sendChatMessage({
          message,
          conversation_id: id ?? null,
          userId,
        })(ctx),
      )();
      if (r._tag === "Left") throw new Error("send failed");
      await flushPersistence();
      return r.right.conversationId;
    };

    test("get returns none for unknown conversation", async () => {
      const result = await getChatConversation("u1", "nonexistent")(ctx)();
      expect(result).toEqual({ _tag: "Right", right: O.none });
    });

    test("appends later turns to the same conversation", async () => {
      const id = await send("one", "u1");
      await send("two", "u1", id);
      const got = await getChatConversation("u1", id)(ctx)();
      if (got._tag !== "Right" || O.isNone(got.right)) throw new Error("none");
      expect(got.right.value.messages).toHaveLength(4);
    });

    test("conversations are scoped to their owner", async () => {
      const id = await send("private", "u1");

      const other = await getChatConversation("u2", id)(ctx)();
      expect(other).toEqual({ _tag: "Right", right: O.none });

      const listOther = await listChatConversations("u2", {})(ctx)();
      if (listOther._tag !== "Right") throw new Error("list failed");
      expect(listOther.right.total).toBe(0);

      const listOwner = await listChatConversations("u1", {})(ctx)();
      if (listOwner._tag !== "Right") throw new Error("list failed");
      expect(listOwner.right.total).toBe(1);
      expect(listOwner.right.data[0]).toMatchObject({ id });
      expect(listOwner.right.data[0]).toHaveProperty("created_at");
      expect(listOwner.right.data[0]).toHaveProperty("updated_at");

      const delOther = await deleteChatConversation("u2", id)(ctx)();
      expect(delOther).toEqual({ _tag: "Right", right: false });
    });

    test("delete removes the conversation", async () => {
      const id = await send("to delete", "u1");
      const del = await deleteChatConversation("u1", id)(ctx)();
      expect(del).toEqual({ _tag: "Right", right: true });
      const got = await getChatConversation("u1", id)(ctx)();
      expect(got).toEqual({ _tag: "Right", right: O.none });
    });

    test("rehydrates agent thread from stored history after restart", async () => {
      const seed = createFakeDb();
      seed.rows.set("11111111-1111-4111-8111-111111111111", {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "u1",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          { id: "1", role: "user", content: "my name is Ada", timestamp: "t" },
          { id: "2", role: "assistant", content: "hi Ada", timestamp: "t" },
        ],
      });
      const invoke = vi.fn().mockResolvedValue({
        messages: [{ id: "m", content: "ok" }],
      });
      const rctx = createMockContext({
        db: seed as unknown as AgentContext["db"],
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke, streamEvents: vi.fn() })),
      });

      await sendChatMessage({
        message: "what is my name?",
        conversation_id: "11111111-1111-4111-8111-111111111111",
        userId: "u1",
      })(rctx)();

      const input = invoke.mock.calls[0][0] as { messages: unknown[] };
      expect(input.messages).toHaveLength(3);
      expect(input.messages[0]).toEqual({
        role: "user",
        content: "my name is Ada",
      });

      // second turn: thread is warm, no re-injection
      await sendChatMessage({
        message: "and now?",
        conversation_id: "11111111-1111-4111-8111-111111111111",
        userId: "u1",
      })(rctx)();
      const second = invoke.mock.calls[1][0] as { messages: unknown[] };
      expect(second.messages).toHaveLength(1);
    });

    test("persistence failure does not fail the reply", async () => {
      const bad = createFakeDb();
      bad.save.mockReturnValue(TE.left(new Error("db down")));
      const bctx = createMockContext({
        db: bad as unknown as AgentContext["db"],
      });
      const r = await sendChatMessage({
        message: "hi",
        conversation_id: null,
        userId: "u1",
      })(bctx)();
      expect(r._tag).toBe("Right");
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
      const events: unknown[] = [];
      for await (const e of sendChatMessageStream({
        userId: "u1",
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
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("Hello "),
                  chatModelEvent("world"),
                ]),
              ),
          }),
        ),
      });

      const events = await collect(ctx);
      const deltas = events.filter((e) => e.type === "content_delta");
      expect(deltas.some((e) => e.content === "Hello ")).toBe(true);
      expect(deltas.some((e) => e.content === "world")).toBe(true);
    });

    test("supervisor node events are not emitted as content_delta", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("platform", { supervisorNode: true }),
                  chatModelEvent("Real answer"),
                ]),
              ),
          }),
        ),
      });

      const events = await collect(ctx);
      const deltas = events.filter((e) => e.type === "content_delta");
      expect(deltas.every((e) => e.content !== "platform")).toBe(true);
      expect(deltas.some((e) => e.content === "Real answer")).toBe(true);
    });

    test("on_tool_start emits tool_call_start with arguments", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(() =>
              asyncEvents([
                toolStartEvent("findActors", {
                  fullName: "Test Actor",
                }),
                chatModelEvent("Here are the actors."),
              ]),
            ),
          }),
        ),
      });

      const events = await collect(ctx);
      const toolStart = events.find((e) => e.type === "tool_call_start");
      expect(toolStart).toBeDefined();
      expect(toolStart.tool_call.name).toBe("findActors");
      expect(toolStart.tool_call.arguments).toContain("Test Actor");
    });

    test("on_tool_end emits tool_call_end with result", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  toolStartEvent("findActors", { ids: ["123"] }),
                  toolEndEvent(
                    "findActors",
                    JSON.stringify({ id: "123", fullName: "Test" }),
                  ),
                  chatModelEvent("Found the actor."),
                ]),
              ),
          }),
        ),
      });

      const events = await collect(ctx);
      const toolEnd = events.find((e) => e.type === "tool_call_end");
      expect(toolEnd).toBeDefined();
      expect(toolEnd.tool_call.name).toBe("findActors");
      expect(toolEnd.tool_call.result).toContain("Test");
    });

    test("think tags produce thinking content_delta events", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
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
          }),
        ),
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
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi
              .fn()
              .mockImplementation(() =>
                asyncEvents([
                  chatModelEvent("<think>first chunk"),
                  chatModelEvent(" second chunk</think>conclusion"),
                ]),
              ),
          }),
        ),
      });

      const events = await collect(ctx);
      const thinking = events.filter(
        (e) => e.type === "content_delta" && e.thinking,
      );
      const regular = events.filter(
        (e) => e.type === "content_delta" && !e.thinking,
      );
      const thinkText = thinking
        .map((e: unknown) => (e as { content: string }).content)
        .join("");
      expect(thinkText).toContain("first chunk");
      expect(thinkText).toContain("second chunk");
      expect(
        regular.some(
          (e: unknown) => (e as { content: string }).content === "conclusion",
        ),
      ).toBe(true);
    });

    test("token usage from usage_metadata is reflected in message_end", async () => {
      ctx = createMockContext({
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(() =>
              asyncEvents([
                chatModelEvent("response", {
                  usageMeta: { input_tokens: 20, output_tokens: 10 },
                }),
              ]),
            ),
          }),
        ),
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

      const events: unknown[] = [];
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
        agentFactory: vi.fn().mockReturnValue(
          TE.right({
            invoke: vi.fn(),
            streamEvents: vi.fn().mockImplementation(function* () {
              yield;
              throw new Error("Stream error");
            }),
          }),
        ),
      });

      const events = await collect(ctx);
      const errorEvent = events.find((e) => e.type === "error");
      expect(errorEvent).toBeDefined();
      expect(errorEvent.error).toContain("Stream error");
    });

    test("uses provided conversation_id and stores messages", async () => {
      const events = await collect(
        ctx,
        "stream msg",
        "11111111-1111-4111-8111-222222222222",
      );

      expect(events[0].type).toBe("message_start");

      await flushPersistence();
      const get = await getChatConversation(
        "u1",
        "11111111-1111-4111-8111-222222222222",
      )(ctx)();
      expect(get._tag).toBe("Right");
      if (get._tag === "Right" && O.isSome(get.right))
        expect(get.right.value.messages.length).toBeGreaterThan(0);
      else throw new Error("stream turn not persisted");
    });

    test("passes a resolved string (not a Promise) to streamEvents when memory is configured", async () => {
      const streamEvents = vi
        .fn()
        .mockImplementation(() => asyncEvents([chatModelEvent("ok")]));
      ctx = createMockContext({
        memoryClient: {
          addMemory: vi.fn().mockReturnValue(TE.right(undefined)),
          searchMemories: vi
            .fn()
            .mockReturnValue(
              TE.right([{ id: "m1", memory: "user likes tests", score: 0.9 }]),
            ),
        },
        agentFactory: vi
          .fn()
          .mockReturnValue(TE.right({ invoke: vi.fn(), streamEvents })),
      });

      const events = await collect(ctx, "hello");

      expect(events.filter((e) => e.type === "error")).toEqual([]);
      const input = streamEvents.mock.calls[0][0] as { messages: unknown[] };
      expect(typeof input.messages[0]).toBe("string");
      expect(input.messages[0]).toContain("hello");
    });

    test("searches and stores memories under the researcher scope for researcher runs", async () => {
      const searchMemories = vi.fn().mockReturnValue(TE.right([]));
      const addMemory = vi.fn().mockReturnValue(TE.right(undefined));
      ctx = createMockContext({ memoryClient: { addMemory, searchMemories } });

      for await (const _ of sendChatMessageStream({
        message: "hi",
        conversation_id: null,
        agent_type: "researcher",
      })(ctx)) {
        // drain
      }

      expect(searchMemories.mock.calls[0][1]).toBe("lies-exposed-researcher");
      expect(addMemory.mock.calls[0][1]).toBe("lies-exposed-researcher");
    });

    test("message_start and message_end include usedProvider when aiConfig is given", async () => {
      const events: unknown[] = [];
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

describe("describeModelEnd", () => {
  test("reports finish reason, tool calls and content tail", () => {
    const out = describeModelEnd({
      output: {
        content: "Now I will create the actor",
        tool_calls: [],
        response_metadata: { finish_reason: "length" },
        usage_metadata: { input_tokens: 1, output_tokens: 2 },
      },
    });
    expect(out).toEqual({
      finishReason: "length",
      toolCalls: 0,
      contentLength: 27,
      contentTail: "Now I will create the actor",
    });
  });

  test("returns null for non-message output", () => {
    expect(describeModelEnd({ output: null })).toBeNull();
    expect(describeModelEnd(undefined)).toBeNull();
  });
});
