import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getActorToolTask } from "../getActor.tool.js";

describe("MCP GET_ACTOR Tool", () => {
  let Test: AppTest;
  let testActors: ActorEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testActors = fc.sample(ActorArb, 5).map((a) =>
      toActorEntity({
        ...a,
        memberIn: [],
        death: undefined,
      }),
    );

    await throwTE(Test.ctx.db.save(ActorEntity, testActors));
  });

  test("Should get actor by ID", async () => {
    const actor = testActors[0];

    const result = await pipe(
      getActorToolTask({ id: actor.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("href");
    expect(content.href).toContain(actor.id);
    expect(content.text).toContain(actor.fullName);
  });

  test("Should handle non-existent actor ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getActorToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const actor = testActors[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "getActor",
        arguments: {
          id: actor.id,
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
    const actor = testActors[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "getActor",
        arguments: {
          id: actor.id,
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
