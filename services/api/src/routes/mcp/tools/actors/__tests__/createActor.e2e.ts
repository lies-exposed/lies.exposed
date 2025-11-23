import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import {
  toAreaEntity,
  toMediaEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createActorToolTask } from "../createActor.tool.js";

describe("MCP CREATE_ACTOR Tool", () => {
  let Test: AppTest;
  let avatar: Media;
  let nationality: AreaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    avatar = fc.sample(MediaArb, 1)[0];
    const areas = fc.sample(AreaArb, 1).map(toAreaEntity);
    nationality = areas[0];

    await throwTE(Test.ctx.db.save(MediaEntity, [avatar].map(toMediaEntity)));
    await throwTE(Test.ctx.db.save(AreaEntity, areas));
  });

  test("Should create a new actor with required fields", async () => {
    const newActorData = {
      username: "test-actor-1",
      fullName: "Test Actor One",
      color: "FF5733",
      excerpt: "A test actor created via MCP tools",
      nationalities: [nationality.id],
      body: undefined,
      avatar: avatar.id,
      bornOn: "1990-01-01",
      diedOn: undefined,
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(newActorData.fullName);
    expect(content).toHaveProperty("href");
    expect(content.href).toMatch(/^actor:\/\//);
  });

  test("Should create actor with all optional fields", async () => {
    const newActorData = {
      username: "complete-test-actor",
      fullName: "Complete Test Actor",
      color: "00FF00",
      excerpt: "A complete test actor",
      nationalities: [nationality.id],
      body: "This is a detailed biography of the test actor.",
      avatar: avatar.id,
      bornOn: "1985-05-15",
      diedOn: "2020-12-31",
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without avatar", async () => {
    const newActorData = {
      username: "no-avatar-actor",
      fullName: "No Avatar Actor",
      color: "0000FF",
      excerpt: "Actor without avatar",
      nationalities: [nationality.id],
      body: undefined,
      avatar: undefined as any,
      bornOn: undefined,
      diedOn: undefined,
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without body content", async () => {
    const newActorData = {
      username: "minimal-actor",
      fullName: "Minimal Actor",
      color: "FFFF00",
      excerpt: "Minimal test actor",
      nationalities: [nationality.id],
      body: undefined,
      avatar: avatar.id,
      bornOn: "1995-03-20",
      diedOn: undefined,
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without dates", async () => {
    const newActorData = {
      username: "no-dates-actor",
      fullName: "No Dates Actor",
      color: "FF00FF",
      excerpt: "Actor without birth or death dates",
      nationalities: [],
      body: undefined,
      avatar: avatar.id,
      bornOn: undefined,
      diedOn: undefined,
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
