import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { toAreaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getAreaToolTask } from "../getArea.tool.js";

describe("MCP GET_AREA Tool", () => {
  let Test: AppTest;
  let testAreas: AreaEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testAreas = fc.sample(AreaArb, 5).map(toAreaEntity);

    await throwTE(Test.ctx.db.save(AreaEntity, testAreas));
  });

  test("Should get area by ID", async () => {
    const area = testAreas[0];

    const result = await pipe(
      getAreaToolTask({ id: area.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("href");
    expect(content.href).toContain(area.id);
    expect(content.text).toContain(area.label);
  });

  test("Should handle non-existent area ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getAreaToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const area = testAreas[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "getArea",
        arguments: {
          id: area.id,
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
    const area = testAreas[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "getArea",
        arguments: {
          id: area.id,
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
