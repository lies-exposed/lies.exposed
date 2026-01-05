import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { NationArb } from "@liexp/test/lib/arbitrary/Nation.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getNationToolTask } from "../getNation.tool.js";

describe("MCP GET_NATION Tool", () => {
  let Test: AppTest;
  let testNations: NationEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  beforeEach(async () => {
    // Create test data with unique ISO codes
    testNations = fc.sample(NationArb, 5).map((n, index) => ({
      ...n,
      isoCode: `XN${index}`, // Using XN prefix to avoid conflicts: XN0, XN1, XN2, XN3, XN4
      description: null, // NationEntity has description field
      actors: [],
    })) as NationEntity[];

    await throwTE(Test.ctx.db.save(NationEntity, testNations));
  });

  test("Should get nation by ID", async () => {
    const nation = testNations[0];

    const result = await pipe(
      getNationToolTask({ id: nation.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringMatching(
        new RegExp(`${nation.name}.*${nation.isoCode}`, "s"),
      ),
      href: expect.stringContaining(nation.id),
    });
  });

  test("Should handle non-existent nation ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getNationToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const nation = testNations[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "getNation",
        arguments: {
          id: nation.id,
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
    const nation = testNations[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "getNation",
        arguments: {
          id: nation.id,
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
