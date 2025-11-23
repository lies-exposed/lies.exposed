import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getEventToolTask } from "../getEvent.tool.js";

describe("MCP GET_EVENT Tool", () => {
  let Test: AppTest;
  let testEvent: EventV2Entity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test event
    testEvent = {
      ...fc.sample(UncategorizedArb, 1)[0],
      links: [],
      media: [],
      keywords: [],
      stories: [],
      actors: [],
      groups: [],
      socialPosts: [],
      location: null,
      deletedAt: null,
    };

    await throwTE(Test.ctx.db.save(EventV2Entity, [testEvent]));
  });

  test("Should get event by ID", async () => {
    const result = await pipe(
      getEventToolTask({ id: testEvent.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: expect.any(String),
          uri: expect.stringContaining(testEvent.id),
        }),
      ]),
    );
  });

  test("Should handle non-existent event ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getEventToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "getEvent",
        arguments: {
          id: testEvent.id,
        },
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
        name: "getEvent",
        arguments: {
          id: testEvent.id,
        },
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
