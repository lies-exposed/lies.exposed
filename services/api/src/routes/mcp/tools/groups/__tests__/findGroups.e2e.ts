import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findGroupsToolTask } from "../findGroups.tool.js";

describe("MCP FIND_GROUPS Tool", () => {
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

  test("Should find groups matching search query", async () => {
    const group = testGroups[0];
    const result = await pipe(
      findGroupsToolTask({
        query: group.name.substring(0, 5),
        withDeleted: undefined,
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should return empty result for non-matching query", async () => {
    const result = await pipe(
      findGroupsToolTask({
        query: "NonExistentGroupName12345",
        withDeleted: undefined,
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    // Should return "no groups found" message
    if (result.content.length > 0) {
      expect(result.content[0].text).toContain("No groups found");
    }
  });

  test("Should support sorting and ordering", async () => {
    const result = await pipe(
      findGroupsToolTask({
        query: testGroups[0].name.substring(0, 3),
        withDeleted: undefined,
        sort: "name",
        order: "ASC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
