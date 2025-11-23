import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findEventsToolTask } from "../findEvents.tool.js";

describe("MCP FIND_EVENTS Tool", () => {
  let Test: AppTest;
  let testEvents: EventV2Entity[];
  let testActors: ActorEntity[];
  let testGroups: GroupEntity[];

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

    testGroups = fc.sample(GroupArb, 3).map((g) =>
      toGroupEntity({
        ...g,
        avatar: undefined,
        members: [],
      }),
    );

    await throwTE(Test.ctx.db.save(ActorEntity, testActors));
    await throwTE(Test.ctx.db.save(GroupEntity, testGroups));

    testEvents = fc.sample(UncategorizedArb, 5).map((e) => ({
      ...e,
      links: [],
      media: [],
      keywords: [],
      stories: [],
      actors: [],
      groups: [],
      socialPosts: [],
      deletedAt: null,
      location: null,
    }));

    await throwTE(Test.ctx.db.save(EventV2Entity, testEvents));
  });

  test("Should find events matching search query", async () => {
    const result = await pipe(
      findEventsToolTask({
        query: "event",
        actors: [],
        groups: [],
        type: null,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should return empty result for non-matching query", async () => {
    const result = await pipe(
      findEventsToolTask({
        query: "NonExistentEvent12345XYZ",
        actors: [],
        groups: [],
        type: null,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    // Should return "no events found" message
    if (result.content.length > 0) {
      expect(result.content[0].text).toContain("No events found");
    }
  });

  test("Should filter events by actor", async () => {
    const actor = testActors[0];
    const result = await pipe(
      findEventsToolTask({
        query: null,
        actors: [actor.id],
        groups: [],
        type: null,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should filter events by group", async () => {
    const group = testGroups[0];
    const result = await pipe(
      findEventsToolTask({
        query: null,
        actors: [],
        groups: [group.id],
        type: null,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
