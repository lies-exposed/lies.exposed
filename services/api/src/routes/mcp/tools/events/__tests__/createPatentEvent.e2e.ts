import { uuid, type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { PatentEventArb } from "@liexp/test/lib/arbitrary/events/PatentEvent.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createPatentEventToolTask } from "../createPatentEvent.tool.js";

describe("MCP CREATE_PATENT_EVENT Tool", () => {
  let Test: AppTest;

  const createPatentEventData = (
    overrides: Partial<{
      source: UUID;
    }> = {},
  ) => {
    const patentEvent = fc.sample(PatentEventArb, 1)[0];
    return {
      title: patentEvent.payload.title,
      date: patentEvent.date.toISOString().split("T")[0],
      draft: patentEvent.draft,
      excerpt: null,
      body: null,
      media: [],
      links: [],
      keywords: [],
      ownerActors: [],
      ownerGroups: [],
      source: overrides.source ?? uuid(),
    };
  };

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should create patent event with required fields", async () => {
    const result = await pipe(
      createPatentEventToolTask(createPatentEventData()),
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

  test("Should create patent event with full details", async () => {
    const result = await pipe(
      createPatentEventToolTask(createPatentEventData({ source: uuid() })),
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
        name: "createPatentEvent",
        arguments: createPatentEventData({ source: uuid() }),
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
        name: "createPatentEvent",
        arguments: createPatentEventData({ source: uuid() }),
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
