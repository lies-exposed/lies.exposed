import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { type Media } from "@liexp/io/lib/http/Media/Media.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import {
  createActorToolTask,
  type CreateActorInputSchema,
} from "../createActor.tool.js";

describe("MCP CREATE_ACTOR Tool", () => {
  let Test: AppTest;
  let avatar: Media;

  beforeAll(async () => {
    Test = await GetAppTest();

    avatar = fc.sample(MediaArb, 1)[0];

    await throwTE(Test.ctx.db.save(MediaEntity, [avatar].map(toMediaEntity)));
  });

  test("Should create a new actor with required fields", async () => {
    const newActorData: CreateActorInputSchema = {
      username: "test-actor-1",
      fullName: "Test Actor One",
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining(newActorData.fullName),
      href: expect.stringMatching(/^actor:\/\//),
    });
  });

  test("Should create actor with all optional fields", async () => {
    const newActorData: CreateActorInputSchema = {
      username: "complete-test-actor",
      fullName: "Complete Test Actor",
      config: {
        color: "00FF00",
        excerpt: "A complete test actor",
        nationalityIds: [],
        body: "This is a detailed biography of the test actor.",
        avatar: avatar.id,
        bornOn: "1985-05-15",
        diedOn: "2020-12-31",
      },
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without avatar", async () => {
    const newActorData: CreateActorInputSchema = {
      username: "no-avatar-actor",
      fullName: "No Avatar Actor",
      config: {
        excerpt: "Actor without avatar",
      },
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without body content", async () => {
    const newActorData: CreateActorInputSchema = {
      username: "minimal-actor",
      fullName: "Minimal Actor",
      config: {
        excerpt: "Minimal test actor",
        avatar: avatar.id,
        bornOn: "1995-03-20",
      },
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create actor without dates", async () => {
    const newActorData: CreateActorInputSchema = {
      username: "no-dates-actor",
      fullName: "No Dates Actor",
      config: {
        excerpt: "Actor without birth or death dates",
        avatar: avatar.id,
      },
    };

    const result = await pipe(
      createActorToolTask(newActorData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
