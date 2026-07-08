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

interface LinkRow {
  id: string;
  url: string;
  title: string | null;
}

interface ActorRow {
  id: string;
}

// ---------------------------------------------------------------------------
// Context — shared across all tests in this file
// ---------------------------------------------------------------------------

let ctx: AgentContext;
const createdLinkIds: string[] = [];
const createdActorIds: string[] = [];

beforeAll(async () => {
  ctx = await loadEvalContext();
});

afterAll(async () => {
  // Safety net in case a test threw before its own cleanup ran.
  if (createdActorIds.length > 0) {
    await queryDb(`DELETE FROM actor WHERE id = ANY($1::uuid[])`, [
      createdActorIds,
    ]);
  }
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

describe("link ingestion (skill-driven) — verified in Postgres", () => {
  cachedTest(
    "link ingestion > a bare URL triggers the link_handling skill and persists a link",
    async () => {
      const beforeRun = new Date().toISOString();

      const events = await collectEvents(
        ctx,
        `Take a look at this, might be worth adding to the platform: ${TEST_URL}`,
      );

      // Proves the skill actually drove this, rather than the model
      // improvising a plausible-looking tool call on its own.
      const skillLoad = toolCallStarts(events).find(
        (e) =>
          e.tool_call.name === "load_skill" &&
          /link_handling/.test(toolArgs(e)),
      );
      expect(
        skillLoad,
        "expected the agent to call load_skill(link_handling) for a bare URL",
      ).toBeDefined();

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
      const linkRows = await queryDb<LinkRow>(
        `SELECT id, url, title FROM link WHERE url = $1`,
        [TEST_URL],
      );
      expect(
        linkRows.length,
        `expected a "link" row with url=${TEST_URL} in Postgres`,
      ).toBeGreaterThan(0);
      const link = linkRows[0];
      createdLinkIds.push(link.id);

      // Proves the skill's scrape-then-extract step ran, not just a bare
      // `link create --url=...` with no content read.
      expect(
        link.title,
        "expected the link's title to be extracted from the page, not left empty",
      ).toBeTruthy();
      expect(link.title?.trim().toLowerCase()).not.toBe(TEST_URL.toLowerCase());

      // The skill's step 5 says to create entities extracted from the page
      // (e.g. the article's subject) if they don't already exist in the
      // (empty, throwaway) test DB — track anything it created for cleanup.
      // This isn't asserted on: whether the model chooses to do this for a
      // single bare URL is a model-quality question, not a plumbing one.
      const actorRows = await queryDb<ActorRow>(
        `SELECT id FROM actor WHERE "createdAt" > $1`,
        [beforeRun],
      );
      createdActorIds.push(...actorRows.map((r) => r.id));

      await queryDb(`DELETE FROM link WHERE id = ANY($1::uuid[])`, [
        [link.id],
      ]);
      createdLinkIds.length = 0;
      if (createdActorIds.length > 0) {
        await queryDb(`DELETE FROM actor WHERE id = ANY($1::uuid[])`, [
          createdActorIds,
        ]);
        createdActorIds.length = 0;
      }
    },
  );
});
