import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import {
  toActorEntity,
  toAreaEntity,
  toGroupEntity,
  toMediaEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { editActorToolTask } from "../editActor.tool.js";

describe("MCP EDIT_ACTOR Tool", () => {
  let Test: AppTest;
  let testActor: ActorEntity;
  let avatar: MediaEntity;
  let testGroup: GroupEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    const actors = fc.sample(ActorArb, 1).map((a) =>
      toActorEntity({
        ...a,
        memberIn: [],
        death: undefined,
      }),
    );
    testActor = actors[0];

    const media = fc.sample(MediaArb, 1).map(toMediaEntity);
    avatar = media[0];

    const areas = fc.sample(AreaArb, 1).map(toAreaEntity);

    const groups = fc.sample(GroupArb, 1).map((g) =>
      toGroupEntity({
        ...g,
        avatar: undefined,
        members: [],
      }),
    );
    testGroup = groups[0];

    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(MediaEntity, media));
    await throwTE(Test.ctx.db.save(AreaEntity, areas));
    await throwTE(Test.ctx.db.save(GroupEntity, groups));
  });

  test("Should update actor fullName", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        fullName: "Updated Full Name",
        username: undefined,
        color: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        avatar: undefined,
        bornOn: undefined,
        diedOn: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain("Updated Full Name");
  });

  test("Should update actor username", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        username: "updated-username",
        fullName: undefined,
        color: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        avatar: undefined,
        bornOn: undefined,
        diedOn: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update actor color", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        color: "00FF00",
        fullName: undefined,
        username: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        avatar: undefined,
        bornOn: undefined,
        diedOn: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update actor excerpt and body", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        excerpt: "Updated excerpt",
        body: "Updated body content",
        fullName: undefined,
        username: undefined,
        color: undefined,
        nationalities: [],
        avatar: undefined,
        bornOn: undefined,
        diedOn: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update actor memberIn groups", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        memberIn: [testGroup.id],
        fullName: undefined,
        username: undefined,
        color: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        avatar: undefined,
        bornOn: undefined,
        diedOn: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update actor avatar", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        avatar: avatar.id,
        fullName: undefined,
        username: undefined,
        color: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        bornOn: undefined,
        diedOn: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update actor birth and death dates", async () => {
    const result = await pipe(
      editActorToolTask({
        id: testActor.id,
        bornOn: "1990-01-01",
        diedOn: "2020-12-31",
        fullName: undefined,
        username: undefined,
        color: undefined,
        excerpt: undefined,
        nationalities: [],
        body: undefined,
        avatar: undefined,
        memberIn: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
