import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { editMediaToolTask } from "../editMedia.tool.js";

describe("MCP EDIT_MEDIA Tool", () => {
  let Test: AppTest;
  let testMedia: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    const media = fc.sample(MediaArb, 1).map(toMediaEntity);
    testMedia = media[0];

    await throwTE(Test.ctx.db.save(MediaEntity, media));
  });

  test("Should update media location", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: "https://example.com/updated-image.jpg",
        type: testMedia.type,
        label: testMedia.label,
        description: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update media label", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: testMedia.location,
        type: testMedia.type,
        label: "Updated Label",
        description: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("Updated Label");
  });

  test("Should update media type", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: testMedia.location,
        type: "image/png",
        label: testMedia.label,
        description: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update media with description", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: testMedia.location,
        type: testMedia.type,
        label: testMedia.label,
        description: "Updated description",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update media removing description", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: testMedia.location,
        type: testMedia.type,
        label: testMedia.label,
        description: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should update all media fields", async () => {
    const result = await pipe(
      editMediaToolTask({
        id: testMedia.id,
        location: "https://example.com/completely-updated.jpg",
        type: "image/jpeg",
        label: "Completely Updated Media",
        description: "All fields have been updated",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("Completely Updated Media");
  });
});
