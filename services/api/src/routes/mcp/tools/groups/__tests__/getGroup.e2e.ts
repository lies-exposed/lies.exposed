import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getGroupToolTask } from "../getGroup.tool.js";

describe("MCP GET_GROUP Tool", () => {
  let Test: AppTest;
  let testGroups: GroupEntity[];
  let testActors: ActorEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testActors = fc.sample(ActorArb, 3).map((a) =>
      toActorEntity({
        ...a,
        memberIn: [],
        death: undefined,
      }),
    );

    testGroups = fc.sample(GroupArb, 5).map((g) =>
      toGroupEntity({
        ...g,
        avatar: undefined,
        members: [],
      }),
    );

    await throwTE(Test.ctx.db.save(ActorEntity, testActors));
    await throwTE(Test.ctx.db.save(GroupEntity, testGroups));
  });

  test("Should get group by ID", async () => {
    const group = testGroups[0];

    const result = await pipe(
      getGroupToolTask({ id: group.id }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("href");
    expect(content.href).toContain(group.id);
    expect(content.text).toContain(group.name);
  });

  test("Should handle non-existent group ID", async () => {
    const nonExistentId = fc.sample(UUIDArb, 1)[0];

    await expect(
      pipe(getGroupToolTask({ id: nonExistentId }), throwRTE(Test.ctx)),
    ).rejects.toThrow();
  });

  test("Should reject requests without token", async () => {
    const group = testGroups[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "getGroup",
        arguments: {
          id: group.id,
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
    const group = testGroups[0];
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "getGroup",
        arguments: {
          id: group.id,
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
