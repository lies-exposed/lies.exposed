import { type BySubjectId } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createQuoteEventToolTask } from "../createQuoteEvent.tool.js";

describe("MCP CREATE_QUOTE_EVENT Tool", () => {
  let Test: AppTest;

  const createQuoteEventData = (
    overrides: Partial<{
      quote: string;
      subject: BySubjectId | null;
      details: string | null;
    }> = {},
  ) => {
    const quoteEvent = fc.sample(getEventArbitrary("Quote"), 1)[0];
    return {
      date: quoteEvent.date.toISOString().split("T")[0],
      draft: quoteEvent.draft,
      excerpt: null,
      body: null,
      media: [],
      links: [],
      keywords: [],
      actor: null,
      subject: overrides.subject ?? null,
      quote: overrides.quote ?? "This is a test quote.",
      details: overrides.details ?? null,
    };
  };

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should create quote event with minimal fields", async () => {
    const result = await pipe(
      createQuoteEventToolTask(createQuoteEventData()),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: expect.any(String),
        }),
      ]),
    );
  });

  test("Should create quote event with all fields", async () => {
    const result = await pipe(
      createQuoteEventToolTask(
        createQuoteEventData({
          subject: { type: "Group", id: uuid() } as BySubjectId,
          quote: "We must act now to protect our planet.",
          details: "Additional context about when and where this was said.",
        }),
      ),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: expect.any(String),
        }),
      ]),
    );
  });

  test("Should reject requests without token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "createQuoteEvent",
        arguments: createQuoteEventData({ quote: "Unauthorized quote" }),
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });

  test("Should reject requests with invalid token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "createQuoteEvent",
        arguments: createQuoteEventData({ quote: "Invalid token quote" }),
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Authorization", "Bearer invalid-token-12345")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });
});
