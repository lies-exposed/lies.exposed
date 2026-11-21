import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { beforeAll, describe, expect } from "vitest";
import { type AgentContext } from "../../../src/context/context.type.js";
import {
  type AgentEvalTest,
  GetAgentEvalTest,
} from "../../../test/AgentEvalTest.js";
import { cachedTest } from "../../../test/evalCache.js";
import { debugEvents, debugRawEvents } from "../../../test/evalDebug.js";
import { sendChatMessageStream } from "../../flows/chat/chat.flow.js";

// ---------------------------------------------------------------------------
// Helpers (same shape as link-ingestion.eval.ts / agent-pipeline.eval.ts)
// ---------------------------------------------------------------------------

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

type ToolCallStartEvent = ChatStreamEvent & {
  type: "tool_call_start";
  tool_call: NonNullable<ChatStreamEvent["tool_call"]>;
};
type ToolCallEndEvent = ChatStreamEvent & {
  type: "tool_call_end";
  tool_call: NonNullable<ChatStreamEvent["tool_call"]>;
};

const toolCallStarts = (events: ChatStreamEvent[]): ToolCallStartEvent[] =>
  events.filter(
    (e): e is ToolCallStartEvent =>
      e.type === "tool_call_start" && e.tool_call !== undefined,
  );

const toolCallEnds = (events: ChatStreamEvent[]): ToolCallEndEvent[] =>
  events.filter(
    (e): e is ToolCallEndEvent =>
      e.type === "tool_call_end" && e.tool_call !== undefined,
  );

const toolArgs = (event: ToolCallStartEvent): string =>
  event.tool_call.arguments ?? "{}";

/** createEvent MCP calls whose arguments carry the given event `type`. */
const createEventCalls = (
  events: ChatStreamEvent[],
  type: string,
): ToolCallStartEvent[] =>
  toolCallStarts(events).filter(
    (e) =>
      e.tool_call.name === "createEvent" &&
      new RegExp(`"type"\\s*:\\s*"${type}"`).test(toolArgs(e)),
  );

const expectCreateEventFinished = (events: ChatStreamEvent[]): void => {
  const end = toolCallEnds(events).find(
    (e) => e.tool_call.name === "createEvent",
  );
  expect(end, "expected the createEvent call to finish").toBeDefined();
};

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentEvalTest;

beforeAll(async () => {
  ctx = await GetAgentEvalTest();
});

// ---------------------------------------------------------------------------
// Atomic event create tests — instruct the agent, verify it calls the
// createEvent MCP tool with the expected `type`
// ---------------------------------------------------------------------------

describe("atomic event create (agent-driven)", () => {
  cachedTest(
    "agent > 'create an uncategorized event' calls createEvent with type Uncategorized",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create an uncategorized event titled Test Event dated 2026-07-01",
      );

      const call = createEventCalls(events, "Uncategorized")[0];
      expect(
        call,
        "expected a createEvent tool call with type Uncategorized",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Test Event");
      expect(toolArgs(call)).toContain("2026-07-01");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a death event' calls createEvent with type Death",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a death event for victim 00000000-0000-0000-0000-000000000000 dated 2026-06-15",
      );

      const call = createEventCalls(events, "Death")[0];
      expect(
        call,
        "expected a createEvent tool call with type Death",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("00000000-0000-0000-0000-000000000000");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a quote' calls createEvent with type Quote",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a quote event for actor 00000000-0000-0000-0000-000000000000 saying Hello world dated 2026-05-20",
      );

      const call = createEventCalls(events, "Quote")[0];
      expect(
        call,
        "expected a createEvent tool call with type Quote",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Hello world");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a transaction' calls createEvent with type Transaction",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a transaction event titled Test Transaction with total 1000 USD from Actor 00000000-0000-0000-0000-000000000000 to Actor 00000000-0000-0000-0000-000000000001 dated 2026-04-10",
      );

      const call = createEventCalls(events, "Transaction")[0];
      expect(
        call,
        "expected a createEvent tool call with type Transaction",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Test Transaction");
      expect(toolArgs(call)).toContain("1000");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a scientific study' calls createEvent with type ScientificStudy",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a scientific study event titled Climate Study with URL https://example.com/study dated 2026-03-01",
      );

      const call = createEventCalls(events, "ScientificStudy")[0];
      expect(
        call,
        "expected a createEvent tool call with type ScientificStudy",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Climate Study");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a book' calls createEvent with type Book",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a book event titled My Book dated 2026-02-14",
      );

      const call = createEventCalls(events, "Book")[0];
      expect(
        call,
        "expected a createEvent tool call with type Book",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("My Book");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a patent' calls createEvent with type Patent",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a patent event titled Patent 12345 from US Patent Office dated 2026-01-20",
      );

      const call = createEventCalls(events, "Patent")[0];
      expect(
        call,
        "expected a createEvent tool call with type Patent",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Patent 12345");

      expectCreateEventFinished(events);
    },
  );

  cachedTest(
    "agent > 'create a documentary' calls createEvent with type Documentary",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a documentary event titled Doc Title with media 00000000-0000-0000-0000-000000000001 dated 2025-12-01",
      );

      const call = createEventCalls(events, "Documentary")[0];
      expect(
        call,
        "expected a createEvent tool call with type Documentary",
      ).toBeDefined();
      expect(toolArgs(call)).toContain("Doc Title");

      expectCreateEventFinished(events);
    },
  );
});
