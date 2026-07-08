import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { afterAll, beforeAll, describe, expect } from "vitest";
import { cachedTest } from "../../../../test/evalCache.js";
import { closeDb, queryDb } from "../../../../test/evalDbClient.js";
import { loadEvalContext } from "../../../../test/evalContext.js";
import { debugEvents, debugRawEvents } from "../../../../test/evalDebug.js";
import { type AgentContext } from "../../../context/context.type.js";
import { sendChatMessageStream } from "../chat.flow.js";

/**
 * Full round trip verified in Postgres, not just in the tool call output.
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

interface LinkRow {
  id: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentContext;
const createdLinkIds: string[] = [];

beforeAll(async () => {
  ctx = await loadEvalContext();
});

afterAll(async () => {
  // Safety net in case a test threw before its own cleanup ran.
  if (createdLinkIds.length > 0) {
    await queryDb(`DELETE FROM link WHERE id = ANY($1::uuid[])`, [
      createdLinkIds,
    ]);
  }
  await closeDb();
});

// ---------------------------------------------------------------------------
// Full flow — verified directly in Postgres
// ---------------------------------------------------------------------------

describe("link ingestion — verified in Postgres", () => {
  cachedTest(
    "link ingestion > reading a URL and creating a link persists the row",
    async () => {
      const events = await collectEvents(
        ctx,
        `Read ${TEST_URL} and create a link record for it with liexp_cli. Do not create any other entities, just the link.`,
      );

      const linkCreateStart = toolCallStarts(events).find(
        (e) =>
          e.tool_call.name === "liexp_cli" &&
          /link\s+create/.test(toolArgs(e)),
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

      // The real assertion: query Postgres directly, independent of what the
      // tool result / model summary claims happened.
      const rows = await queryDb<LinkRow>(
        `SELECT id, url FROM link WHERE url = $1`,
        [TEST_URL],
      );
      expect(
        rows.length,
        `expected a "link" row with url=${TEST_URL} in Postgres`,
      ).toBeGreaterThan(0);
      createdLinkIds.push(...rows.map((r) => r.id));

      await queryDb(`DELETE FROM link WHERE id = ANY($1::uuid[])`, [
        rows.map((r) => r.id),
      ]);
      createdLinkIds.length = 0;
    },
  );
});
