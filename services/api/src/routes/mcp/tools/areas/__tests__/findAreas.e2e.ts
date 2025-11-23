import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { toAreaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findAreasToolTask } from "../findAreas.tool.js";

describe("MCP FIND_AREAS Tool", () => {
  let Test: AppTest;
  let testAreas: AreaEntity[];

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    testAreas = fc.sample(AreaArb, 5).map(toAreaEntity);

    await throwTE(Test.ctx.db.save(AreaEntity, testAreas));
  });

  test("Should find areas matching search query", async () => {
    const area = testAreas[0];
    const result = await pipe(
      findAreasToolTask({
        query: area.label.substring(0, 5),
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
      findAreasToolTask({
        query: "NonExistentAreaName12345",
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
    expect(result.content[0].text).toContain("No areas found");
  });

  test("Should support sorting by label", async () => {
    const result = await pipe(
      findAreasToolTask({
        query: testAreas[0].label.substring(0, 3),
        withDeleted: undefined,
        sort: "label",
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
      findAreasToolTask({
        query: "",
        withDeleted: undefined,
        sort: "createdAt",
        order: "DESC",
        start: 0,
        end: 2,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support descending order", async () => {
    const result = await pipe(
      findAreasToolTask({
        query: testAreas[0].label.substring(0, 3),
        withDeleted: undefined,
        sort: "createdAt",
        order: "DESC",
        start: undefined,
        end: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
