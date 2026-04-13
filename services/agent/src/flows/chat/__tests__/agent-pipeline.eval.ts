import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { beforeAll, describe, expect } from "vitest";
import { cachedTest } from "../../../../test/evalCache.js";
import { loadEvalContext } from "../../../../test/evalContext.js";
import { debugEvents, debugRawEvents } from "../../../../test/evalDebug.js";
import { type AgentContext } from "../../../context/context.type.js";
import { sendChatMessageStream } from "../chat.flow.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Drain the stream and return all emitted events.
 * When DEBUG_EVAL=1:
 *   .eval-debug/<message>.json      — processed ChatStreamEvents
 *   .eval-debug/<message>-raw.json  — raw LangGraph streamEvents
 *   .eval-debug/http/               — HTTP request/response pairs to the LLM
 */
const collectEvents = async (
  ctx: AgentContext,
  message: string,
): Promise<ChatStreamEvent[]> => {
  const events: ChatStreamEvent[] = [];
  const rawEvents: unknown[] = [];

  for await (const event of sendChatMessageStream({
    message,
    conversation_id: null,
    onRawEvent: (e) => rawEvents.push(e),
  })(ctx)) {
    events.push(event);
  }

  debugEvents(message, events);
  debugRawEvents(message, rawEvents);
  return events;
};

// ChatStreamEvent is a flat struct (not a discriminated union), so we use a
// local alias to make field access ergonomic inside tests.
type ToolCallStartEvent = ChatStreamEvent & {
  type: "tool_call_start";
  tool_call: NonNullable<ChatStreamEvent["tool_call"]>;
};
type ContentDeltaEvent = ChatStreamEvent & {
  type: "content_delta";
  content: string;
};

/** Extract all tool_call_start events from a collected event list. */
const toolCallStarts = (events: ChatStreamEvent[]): ToolCallStartEvent[] =>
  events.filter(
    (e): e is ToolCallStartEvent =>
      e.type === "tool_call_start" && e.tool_call !== undefined,
  );

/** Return the raw arguments string from a tool_call_start event. */
const toolArgs = (event: ToolCallStartEvent): string =>
  event.tool_call.arguments ?? "{}";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ACTOR_FIXTURE = {
  id: "00000000-0000-0000-0000-000000000001",
  fullName: "Test Actor",
  username: "test-actor",
  avatar: null,
  bio: [],
  bornOn: null,
  diedOn: null,
  nationality: null,
  color: "#FF0000",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentContext;

beforeAll(async () => {
  ctx = await loadEvalContext();
});

// ---------------------------------------------------------------------------
// Actor operations
// ---------------------------------------------------------------------------

describe("actor operations", () => {
  cachedTest(
    "actor operations > listing actors calls liexp_cli with actor list",
    async () => {
      const events = await collectEvents(ctx, "list the most recent actors");
      const calls = toolCallStarts(events);

      const cliCall = calls.find((e) => e.tool_call.name === "liexp_cli");
      expect(cliCall, "expected a liexp_cli tool call").toBeDefined();
      expect(toolArgs(cliCall!)).toMatch(/actor\s+(list|find)/);
    },
  );

  cachedTest(
    "actor operations > getting a specific actor by id calls liexp_cli actor get",
    async () => {
      const actorId = ACTOR_FIXTURE.id;

      const events = await collectEvents(
        ctx,
        `get the actor with id ${actorId}`,
      );
      const calls = toolCallStarts(events);

      const cliCall = calls.find((e) => e.tool_call.name === "liexp_cli");
      expect(cliCall).toBeDefined();
      expect(toolArgs(cliCall!)).toMatch(/actor\s+get/);
      expect(toolArgs(cliCall!)).toContain(actorId);
    },
  );
});

// ---------------------------------------------------------------------------
// Event operations
// ---------------------------------------------------------------------------

describe("event operations", () => {
  cachedTest(
    "event operations > listing events calls liexp_cli with event list",
    async () => {
      const events = await collectEvents(ctx, "show me the latest events");
      const calls = toolCallStarts(events);

      const cliCall = calls.find((e) => e.tool_call.name === "liexp_cli");
      expect(cliCall).toBeDefined();
      expect(toolArgs(cliCall!)).toMatch(/event\s+(list|find)/);
    },
  );
});

// ---------------------------------------------------------------------------
// Group operations
// ---------------------------------------------------------------------------

describe("group operations", () => {
  cachedTest(
    "group operations > listing groups calls liexp_cli with group list",
    async () => {
      const events = await collectEvents(ctx, "list all groups");
      const calls = toolCallStarts(events);

      const cliCall = calls.find((e) => e.tool_call.name === "liexp_cli");
      expect(cliCall).toBeDefined();
      expect(toolArgs(cliCall!)).toMatch(/group\s+(list|find)/);
    },
  );
});

// ---------------------------------------------------------------------------
// Multi-agent routing
// ---------------------------------------------------------------------------

describe("multi-agent routing", () => {
  cachedTest(
    "multi-agent routing > a platform management request does not leak the supervisor routing word",
    async () => {
      const events = await collectEvents(
        ctx,
        "list actors sorted by creation date",
      );

      const content = events
        .filter((e): e is ContentDeltaEvent => e.type === "content_delta")
        .map((e) => e.content)
        .join("");

      expect(content).not.toMatch(/^(platform|researcher)$/i);

      const cliCall = toolCallStarts(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliCall).toBeDefined();
    },
  );

  cachedTest(
    "multi-agent routing > a web research request does not emit a liexp_cli tool call",
    async () => {
      const events = await collectEvents(
        ctx,
        "search the web for recent news about climate change",
      );

      const cliCall = toolCallStarts(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliCall).toBeUndefined();
    },
  );
});

// ---------------------------------------------------------------------------
// Stream shape
// ---------------------------------------------------------------------------

describe("stream shape", () => {
  cachedTest(
    "stream shape > every response starts with message_start and ends with message_end",
    async () => {
      const events = await collectEvents(ctx, "list actors");

      expect(events[0].type).toBe("message_start");
      expect(events[events.length - 1].type).toBe("message_end");
    },
  );

  cachedTest(
    "stream shape > no error event is emitted on a successful request",
    async () => {
      const events = await collectEvents(ctx, "list actors");
      expect(events.find((e) => e.type === "error")).toBeUndefined();
    },
  );
});

// ---------------------------------------------------------------------------
// Full flow — end-to-end with tool execution
// ---------------------------------------------------------------------------

type ToolCallEndEvent = ChatStreamEvent & {
  type: "tool_call_end";
  tool_call: NonNullable<ChatStreamEvent["tool_call"]>;
};

const toolCallEnds = (events: ChatStreamEvent[]): ToolCallEndEvent[] =>
  events.filter(
    (e): e is ToolCallEndEvent =>
      e.type === "tool_call_end" && e.tool_call !== undefined,
  );

describe.only("full flow with tool execution", () => {
  // BUG: LangGraph's createReactAgent doesn't emit on_tool_end events,
  // so the tool result is never received and "No response generated" is returned.
  // This test documents the expected behavior once the pipeline is fixed.
  cachedTest(
    "full flow > querying last actor executes tool and returns response",
    async () => {
      const events = await collectEvents(
        ctx,
        "What is the last created actor?",
      );

      const toolStarts = toolCallStarts(events);
      const cliCall = toolStarts.find((e) => e.tool_call.name === "liexp_cli");
      expect(cliCall, "expected liexp_cli tool call").toBeDefined();

      const toolEnds = toolCallEnds(events);
      const cliResult = toolEnds.find((e) => e.tool_call.name === "liexp_cli");
      expect(
        cliResult,
        "expected tool execution (tool_call_end event from on_tool_end)",
      ).toBeDefined();

      const contentDeltas = events
        .filter((e): e is ContentDeltaEvent => e.type === "content_delta")
        .map((e) => e.content)
        .join("");
      expect(contentDeltas).toBeTruthy();
      expect(contentDeltas).not.toBe("No response generated");
    },
  );
});
