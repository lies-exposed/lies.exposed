import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { NationArb } from "@liexp/test/lib/arbitrary/Nation.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findNationsToolTask } from "../findNations.tool.js";

describe("MCP FIND_NATIONS Tool", () => {
  let Test: AppTest;
  let testNations: NationEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  beforeEach(async () => {
    // Create test data with specific names and ISO codes for testing
    const [baseNation1, baseNation2, baseNation3] = fc.sample(NationArb, 3);
    testNations = [
      {
        ...baseNation1,
        name: "United States",
        description: "A country in North America",
        isoCode: "ZA", // Using unique test ISO codes
        actors: [],
        deletedAt: null,
      },
      {
        ...baseNation2,
        name: "Italy",
        description: "A country in Europe",
        isoCode: "ZB", // Using unique test ISO codes
        actors: [],
        deletedAt: null,
      },
      {
        ...baseNation3,
        name: "France",
        description: "A country in Europe",
        isoCode: "ZC", // Using unique test ISO codes
        actors: [],
        deletedAt: null,
      },
    ];

    await throwTE(Test.ctx.db.save(NationEntity, testNations));
  });

  test("Should find nations matching search query by name", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: "United",
        isoCode: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("United States"),
    });
  });

  test("Should find nations by ISO code", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: undefined,
        isoCode: "ZB",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringMatching(/Italy.*ZB/s),
    });
  });

  test("Should find nations with case-insensitive name search", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: "france",
        isoCode: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("France"),
    });
  });

  test("Should find nations with case-insensitive ISO code search", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: undefined,
        isoCode: "za",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("United States"),
    });
  });

  test("Should support partial name matching", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: "Ital",
        isoCode: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("Italy"),
    });
  });

  test("Should combine name and ISO code filters", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: "France",
        isoCode: "ZC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringMatching(/France.*ZC/s),
    });
  });

  test("Should return empty result for non-matching query", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: "NonExistentNationName99999",
        isoCode: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBe(1);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("No nations found"),
    });
  });

  test("Should return all nations when no filters provided", async () => {
    const result = await pipe(
      findNationsToolTask({
        name: undefined,
        isoCode: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
  });

  test("Should include nation ID in result", async () => {
    const nation = testNations[0];
    const result = await pipe(
      findNationsToolTask({
        name: undefined,
        isoCode: nation.isoCode, // Search by ISO code for more reliable match
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining(nation.name),
    });
  });

  test("Should reject requests without token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "findNations",
        arguments: {
          name: "Italy",
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
      id: 2,
      method: "tools/call",
      params: {
        name: "findNations",
        arguments: {
          name: "Italy",
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
