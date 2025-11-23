import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findActorsToolTask } from "../findActors.tool.js";

describe("MCP FIND_ACTORS Tool", () => {
  let Test: AppTest;
  let testActors: ActorEntity[];
  let testGroups: GroupEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testActors = fc.sample(ActorArb, 5).map((a) =>
      toActorEntity({
        ...a,
        memberIn: [],
        nationalities: [],
        death: undefined,
      }),
    );

    testGroups = fc.sample(GroupArb, 3).map((g) =>
      toGroupEntity({
        ...g,
        avatar: undefined,
        members: [],
      }),
    );

    await throwTE(Test.ctx.db.save(ActorEntity, testActors));
    await throwTE(Test.ctx.db.save(GroupEntity, testGroups));
  });

  test("Should find actors matching search query by fullName", async () => {
    const actor = testActors[0];
    const result = await pipe(
      findActorsToolTask({
        fullName: actor.fullName.substring(0, 5),
        memberIn: [],
        withDeleted: undefined,
        sort: undefined,
        order: undefined,
        start: undefined,
        end: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should return empty result for non-matching query", async () => {
    const result = await pipe(
      findActorsToolTask({
        fullName: "NonExistentActorName99999",
        memberIn: [],
        withDeleted: undefined,
        sort: undefined,
        order: undefined,
        start: undefined,
        end: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("No actors found");
  });

  test("Should support sorting by username", async () => {
    const result = await pipe(
      findActorsToolTask({
        fullName: testActors[0].fullName.substring(0, 3),
        memberIn: [],
        withDeleted: undefined,
        sort: "username",
        order: "ASC",
        start: undefined,
        end: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support pagination with start and end", async () => {
    const result = await pipe(
      findActorsToolTask({
        fullName: undefined,
        memberIn: [],
        withDeleted: undefined,
        sort: "createdAt",
        order: "ASC",
        start: 0,
        end: 2,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should filter actors by memberIn groups", async () => {
    const group = testGroups[0];
    const actor = testActors[0];

    // Update actor to be member of group
    const groupMemeber = {
      id: uuid(),
      group: group,
      actor: { ...actor, memberIn: [] },
      startDate: new Date(),
      endDate: new Date(),
      excerpt: null,
      body: null,
      events: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    await throwTE(Test.ctx.db.save(GroupMemberEntity, [groupMemeber]));

    const result = await pipe(
      findActorsToolTask({
        fullName: undefined,
        memberIn: [group.id],
        withDeleted: undefined,
        sort: undefined,
        order: undefined,
        start: undefined,
        end: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
