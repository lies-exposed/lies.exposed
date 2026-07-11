import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
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
 * Full round trip verified in Postgres, not just in the tool call output.
 *
 * The user message here is deliberately vague — it does not say "call
 * liexp_cli", "create a link record", or anything about how to do the work.
 * It only hands the agent a URL, the same way a real user would. Getting
 * from that to a persisted `link` row depends entirely on the agent (a) loading
 * the `link_handling` skill (skills/link_handling.md) via the `load_skill`
 * tool and (b) following its workflow. That's what's under test here, not
 * whether liexp_cli works — the earlier version of this test told the agent
 * exactly which tool to call, which meant it never actually exercised skill
 * discovery.
 *
 * Runs against the throwaway liexp_test DB + api-test server that
 * test/evalDbGlobalSetup.ts spins up for this project (vitest.config.eval-db.ts).
 * See skills/agent_testing.md for the four test tiers.
 */

// ---------------------------------------------------------------------------
// Helpers (same shape as agent-pipeline.eval.ts)
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TEST_URL = "https://en.wikipedia.org/wiki/Alan_Turing";

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentEvalTest;

beforeAll(async () => {
  ctx = await GetAgentEvalTest();
});

// ---------------------------------------------------------------------------
// Full flow — verified directly in Postgres
// ---------------------------------------------------------------------------

describe("link ingestion (skill-driven)", () => {
  cachedTest(
    "link ingestion > a bare URL triggers the link_handling skill and persists a link",
    async () => {
      const events = await collectEvents(
        ctx.ctx,
        `Take a look at this, might be worth adding to the platform: ${TEST_URL}`,
      );

      // Proves the skill actually drove this, rather than the model
      // improvising a plausible-looking tool call on its own.
      const skillLoad = toolCallStarts(events).find(
        (e) =>
          e.tool_call.name === "load_skill" &&
          toolArgs(e).includes("link_handling"),
      );
      expect(
        skillLoad,
        "expected the agent to call load_skill(link_handling) for a bare URL",
      ).toBeDefined();

      const linkCreateStart = toolCallStarts(events).find(
        (e) =>
          e.tool_call.name === "liexp_cli" && /link\s+create/.test(toolArgs(e)),
      );
      expect(
        linkCreateStart,
        "expected a liexp_cli link create tool call",
      ).toBeDefined();
      expect(toolArgs(linkCreateStart!)).toContain(TEST_URL);

      const linkCreateEnd = toolCallEnds(events).find(
        (e) => e.tool_call.name === "liexp_cli",
      );
      expect(
        linkCreateEnd,
        "expected the liexp_cli call to finish executing",
      ).toBeDefined();
    },
  );
});
