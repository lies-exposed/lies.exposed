import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import {
  toAreaEntity,
  toMediaEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { editAreaToolTask } from "../editArea.tool.js";

describe("MCP EDIT_AREA Tool", () => {
  let Test: AppTest;
  let areaToEdit: AreaEntity;
  let testMedia: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    areaToEdit = toAreaEntity({
      ...fc.sample(AreaArb, 1)[0],
      label: "Area To Edit",
    });

    const media = fc.sample(MediaArb, 1).map(toMediaEntity);
    testMedia = media[0];

    await throwTE(Test.ctx.db.save(AreaEntity, [areaToEdit]));
    await throwTE(Test.ctx.db.save(MediaEntity, media));
  });

  test("Should edit area label", async () => {
    const result = await pipe(
      editAreaToolTask({
        id: areaToEdit.id,
        label: "Updated Area Name",
        body: undefined,
        draft: undefined,
        featuredImage: undefined,
        media: [],
        events: [],
        updateGeometry: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content.text).toContain("Updated Area Name");
  });

  test("Should edit area draft status", async () => {
    const result = await pipe(
      editAreaToolTask({
        id: areaToEdit.id,
        draft: true,
        label: undefined,
        body: undefined,
        featuredImage: undefined,
        media: [],
        events: [],
        updateGeometry: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit area body", async () => {
    const result = await pipe(
      editAreaToolTask({
        id: areaToEdit.id,
        body: "Updated description text",
        label: undefined,
        draft: undefined,
        featuredImage: undefined,
        media: [],
        events: [],
        updateGeometry: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit area featuredImage", async () => {
    const result = await pipe(
      editAreaToolTask({
        id: areaToEdit.id,
        featuredImage: testMedia.id,
        label: undefined,
        body: undefined,
        draft: undefined,
        media: [],
        events: [],
        updateGeometry: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit multiple fields at once", async () => {
    const result = await pipe(
      editAreaToolTask({
        id: areaToEdit.id,
        label: "Multi-Field Update",
        body: "New description",
        draft: false,
        featuredImage: testMedia.id,
        media: [testMedia.id],
        events: [],
        updateGeometry: false,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("Multi-Field Update");
  });
});
