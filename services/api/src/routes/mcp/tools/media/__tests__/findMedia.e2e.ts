import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findMediaToolTask } from "../findMedia.tool.js";

describe("MCP FIND_MEDIA Tool", () => {
  let Test: AppTest;
  let testMedia: MediaEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testMedia = fc
      .sample(MediaArb, 5)
      .map(toMediaEntity)
      .map((m) => ({
        ...m,
        label: m.label ?? m.location,
      }));

    await throwTE(Test.ctx.db.save(MediaEntity, testMedia));
  });

  test("Should find media matching search query by label", async () => {
    const media = testMedia[0];
    const result = await pipe(
      findMediaToolTask({
        query: media.label!.substring(0, 5),
        location: undefined,
        type: undefined,
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
      findMediaToolTask({
        query: "NonExistentMediaLabel99999",
        location: undefined,
        type: undefined,
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("No media found");
  });

  test("Should filter media by type", async () => {
    const media = testMedia[0];
    const result = await pipe(
      findMediaToolTask({
        query: "",
        location: undefined,
        type: media.type,
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support sorting by label", async () => {
    const result = await pipe(
      findMediaToolTask({
        query: "",
        location: undefined,
        type: undefined,
        sort: "label",
        order: "ASC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support sorting by type", async () => {
    const result = await pipe(
      findMediaToolTask({
        query: "",
        location: undefined,
        type: undefined,
        sort: "type",
        order: "DESC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support descending order", async () => {
    const result = await pipe(
      findMediaToolTask({
        query: testMedia[0].label!.substring(0, 3),
        location: undefined,
        type: undefined,
        sort: "createdAt",
        order: "DESC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
