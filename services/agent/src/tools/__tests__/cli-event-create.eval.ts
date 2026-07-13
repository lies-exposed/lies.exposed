import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { beforeAll, describe, expect } from "vitest";
import {
  type AgentEvalTest,
  GetAgentEvalTest,
} from "../../../test/AgentEvalTest.js";
import { cachedTest } from "../../../test/evalCache.js";
import { debugEvents, debugRawEvents } from "../../../test/evalDebug.js";
import { type AgentContext } from "../../../context/context.type.js";
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

const liexpCliCalls = (events: ChatStreamEvent[]): ToolCallStartEvent[] =>
  toolCallStarts(events).filter((e) => e.tool_call.name === "liexp_cli");

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentEvalTest;

beforeAll(async () => {
  ctx = await GetAgentEvalTest();
});

// ---------------------------------------------------------------------------
// Atomic event create tests — instruct the agent, verify it calls liexp_cli
// ---------------------------------------------------------------------------

describe("atomic event create (agent-driven)", () => {
  cachedTest(
    "agent > 'create an uncategorized event' calls event uncategorized create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create an uncategorized event titled Test Event dated 2026-07-01",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+uncategorized\s+create/.test(toolArgs(e)),
      );
      expect(
        cliCall,
        "expected a liexp_cli event uncategorized create tool call",
      ).toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Test Event");
      expect(toolArgs(cliCall!)).toContain("2026-07-01");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a death event' calls event death create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a death event for victim 00000000-0000-0000-0000-000000000000 dated 2026-06-15",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+death\s+create/.test(toolArgs(e)),
      );
      expect(cliCall, "expected a liexp_cli event death create tool call").toBeDefined();
      expect(toolArgs(cliCall!)).toContain("00000000-0000-0000-0000-000000000000");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a quote' calls event quote create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a quote event for actor 00000000-0000-0000-0000-000000000000 saying Hello world dated 2026-05-20",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+quote\s+create/.test(toolArgs(e)),
      );
      expect(cliCall, "expected a liexp_cli event quote create tool call").toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Hello world");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a transaction' calls event transaction create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a transaction event titled Test Transaction with total 1000 USD from Actor 00000000-0000-0000-0000-000000000000 to Actor 00000000-0000-0000-0000-000000000001 dated 2026-04-10",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+transaction\s+create/.test(toolArgs(e)),
      );
      expect(
        cliCall,
        "expected a liexp_cli event transaction create tool call",
      ).toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Test Transaction");
      expect(toolArgs(cliCall!)).toContain("1000");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a scientific study' calls event scientific-study create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a scientific study event titled Climate Study with URL https://example.com/study dated 2026-03-01",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+scientific-study\s+create/.test(toolArgs(e)),
      );
      expect(
        cliCall,
        "expected a liexp_cli event scientific-study create tool call",
      ).toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Climate Study");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a book' calls event book create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a book event titled My Book dated 2026-02-14",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+book\s+create/.test(toolArgs(e)),
      );
      expect(cliCall, "expected a liexp_cli event book create tool call").toBeDefined();
      expect(toolArgs(cliCall!)).toContain("My Book");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a patent' calls event patent create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a patent event titled Patent 12345 from US Patent Office dated 2026-01-20",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+patent\s+create/.test(toolArgs(e)),
      );
      expect(cliCall, "expected a liexp_cli event patent create tool call").toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Patent 12345");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );

  cachedTest(
    "agent > 'create a documentary' calls event documentary create",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        "Create a documentary event titled Doc Title with media 00000000-0000-0000-0000-000000000001 dated 2025-12-01",
      );

      const cliCall = liexpCliCalls(events).find((e) =>
        /event\s+documentary\s+create/.test(toolArgs(e)),
      );
      expect(
        cliCall,
        "expected a liexp_cli event documentary create tool call",
      ).toBeDefined();
      expect(toolArgs(cliCall!)).toContain("Doc Title");

      const cliEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(cliEnd, "expected the liexp_cli call to finish").toBeDefined();
    },
  );
});
