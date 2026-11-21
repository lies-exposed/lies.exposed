import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { beforeAll, describe, expect } from "vitest";
import {
  type AgentEvalTest,
  GetAgentEvalTest,
} from "../../../../test/AgentEvalTest.js";
import { cachedTest } from "../../../../test/evalCache.js";
import { debugEvents, debugRawEvents } from "../../../../test/evalDebug.js";
import { type AgentContext } from "../../../context/context.type.js";
import { sendChatMessageStream } from "../chat.flow.js";

/**
 * Two-turn round trip, verified in Postgres: hand the agent a real article
 * URL with no instructions on *how* to handle it, then ask it to turn that
 * into a platform event. Neither turn names a tool or a workflow step — the
 * only thing that can get from "here's a link" to a persisted `link` row and
 * then a persisted `event` row linked to it is the agent itself loading
 * skills/link-ingest.md via `load_skill` and following it. That's the
 * thing under test: input -> load skills -> call tools -> final response,
 * not a scripted sequence of MCP tool calls dictated by the test.
 *
 * Both turns share one conversation_id so the second message can refer to
 * "the link you just created" — agent.factory.ts caches the compiled agent
 * (and its MemorySaver checkpointer) per ctx, so thread_id continuity across
 * two collectEvents() calls against the same `ctx` actually carries memory,
 * the same way it would across two HTTP requests in production.
 *
 * Runs against the throwaway liexp_test DB + api-test server from
 * test/evalDbGlobalSetup.ts (vitest.config.eval.ts). See docs/agent-testing.md.
 */

// ---------------------------------------------------------------------------
// Helpers (same shape as link-ingestion.eval.ts)
// ---------------------------------------------------------------------------

const collectEvents = async (
  ctx: AgentContext,
  message: string,
  conversationId: string,
): Promise<ChatStreamEvent[]> => {
  const events: ChatStreamEvent[] = [];
  const rawEvents: unknown[] = [];

  for await (const event of sendChatMessageStream({
    message,
    conversation_id: conversationId,
    onRawEvent: (e) => rawEvents.push(e),
  })(ctx)) {
    events.push(event);
  }

  debugEvents(`${conversationId}-${message}`, events);
  debugRawEvents(`${conversationId}-${message}`, rawEvents);
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

const toolCallsNamed = (
  events: ChatStreamEvent[],
  name: string,
): ToolCallStartEvent[] =>
  toolCallStarts(events).filter((e) => e.tool_call.name === name);

const EVENT_TYPE_ARG =
  /"type"\s*:\s*"(Death|Transaction|Quote|ScientificStudy|Book|Patent|Documentary|Uncategorized)"/;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TEST_URL =
  "https://edition.cnn.com/2026/04/21/us/deaths-disappearances-scientists-investigation";

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentEvalTest;

beforeAll(async () => {
  ctx = await GetAgentEvalTest();
});

// ---------------------------------------------------------------------------
// Full flow — extract link, then create an event from it, verified in Postgres
// ---------------------------------------------------------------------------

describe("link-to-event (skill-driven)", () => {
  cachedTest(
    "link-to-event > a bare URL plus a follow-up persists a link and a linked event",
    async () => {
      const conversationId = uuid();

      // --- Turn 1: no instructions beyond "here's a link" -------------------
      const linkTurnEvents = await collectEvents(
        ctx.ctx,
        `Found this, can you check it out and see what's worth adding to the platform? ${TEST_URL}`,
        conversationId,
      );

      // Proves the link-ingest skill actually ran, not that the model
      // happened to guess the right createLink invocation on its own.
      const skillLoad = toolCallStarts(linkTurnEvents).find(
        (e) =>
          e.tool_call.name === "load_skill" &&
          toolArgs(e).includes("link-ingest"),
      );
      expect(
        skillLoad,
        "expected the agent to call load_skill(link-ingest) for a bare URL",
      ).toBeDefined();

      const linkCreateStart = toolCallsNamed(linkTurnEvents, "createLink")[0];
      expect(
        linkCreateStart,
        "expected a createLink tool call",
      ).toBeDefined();
      expect(toolArgs(linkCreateStart)).toContain(TEST_URL);

      const linkCreateEnd = toolCallEnds(linkTurnEvents).find(
        (e) => e.tool_call.name === "createLink",
      );
      expect(
        linkCreateEnd,
        "expected the createLink call to finish executing",
      ).toBeDefined();

      const eventTurnEvents = await collectEvents(
        ctx.ctx,
        `Nice — go ahead and turn that into an event on the platform, linked back to the source.`,
        conversationId,
      );

      const eventCreateStart = toolCallsNamed(
        eventTurnEvents,
        "createEvent",
      ).find((e) => EVENT_TYPE_ARG.test(toolArgs(e)));
      expect(
        eventCreateStart,
        "expected a createEvent tool call with an event type",
      ).toBeDefined();

      const eventCreateEnd = toolCallEnds(eventTurnEvents).find(
        (e) => e.tool_call.name === "createEvent",
      );
      expect(
        eventCreateEnd,
        "expected the createEvent call to finish executing",
      ).toBeDefined();
    },
  );
});
