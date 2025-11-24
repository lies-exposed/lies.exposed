import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { toLinkEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getLinkToolTask } from "../getLink.tool.js";

describe("MCP GET_LINK Tool", () => {
  let Test: AppTest;
  let testLinks: LinkEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testLinks = fc.sample(LinkArb, 5).map((link) =>
      toLinkEntity({
        ...link,
        events: [],
        image: undefined,
      }),
    );

    await throwTE(Test.ctx.db.save(LinkEntity, testLinks));
  });

  test("Should get link by ID", async () => {
    const link = testLinks[0];

    const result = await pipe(
      getLinkToolTask({ id: link.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("href");
    expect(content.href).toContain(link.id);
    expect(content.text).toContain(link.title);
  });

  test("Should handle non-existent link ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getLinkToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const link = testLinks[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "getLink",
        arguments: {
          id: link.id,
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
    const link = testLinks[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "getLink",
        arguments: {
          id: link.id,
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
