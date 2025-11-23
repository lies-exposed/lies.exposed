import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { CreateEventBodyArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createUncategorizedEventToolTask } from "../createUncategorizedEvent.tool.js";

describe("MCP CREATE_UNCATEGORIZED_EVENT Tool", () => {
  let Test: AppTest;

  const createUncategorizedEventData = () => {
    const createEventBody = fc.sample(
      CreateEventBodyArb({ linksIds: true, mediaIds: true, keywordIds: true }),
      1,
    )[0];

    return {
      ...createEventBody,
      title: createEventBody.payload.title,
      date: createEventBody.date.toISOString(),
      actors: [],
      groups: [],
      links: [],
      groupsMembers: [],
      media: [],
      keywords: [],
      location: null,
      endDate: null,
    };
  };

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should create uncategorized event with required fields", async () => {
    const result = await pipe(
      createUncategorizedEventToolTask(createUncategorizedEventData()),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: expect.any(String),
          uri: expect.stringMatching(/^event:\/\//),
        }),
      ]),
    );
  });

  test("Should create event with optional fields", async () => {
    const result = await pipe(
      createUncategorizedEventToolTask(createUncategorizedEventData()),
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
        name: "createUncategorizedEvent",
        arguments: createUncategorizedEventData(),
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
        name: "createUncategorizedEvent",
        arguments: createUncategorizedEventData(),
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
