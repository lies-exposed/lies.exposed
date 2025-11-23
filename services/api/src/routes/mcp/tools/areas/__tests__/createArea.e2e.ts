import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createAreaToolTask } from "../createArea.tool.js";

describe("MCP CREATE_AREA Tool", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  test("Should create a new area with Point geometry", async () => {
    const newAreaData = {
      label: "Test Area",
      slug: "test-area-001",
      draft: false,
      body: "A test area created via MCP tools",
      geometry: {
        type: "Point" as const,
        coordinates: [12.4964, 41.9028], // Rome coordinates
      },
    };

    const result = await pipe(
      createAreaToolTask(newAreaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(newAreaData.label);
  });

  test("Should create area as draft", async () => {
    const newAreaData = {
      label: "Draft Test Area",
      slug: "draft-test-area",
      draft: true,
      body: "A draft area",
      geometry: {
        type: "Point" as const,
        coordinates: [-0.1276, 51.5074], // London coordinates
      },
    };

    const result = await pipe(
      createAreaToolTask(newAreaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should return existing area when slug already exists", async () => {
    const existingSlug = "existing-area-slug";
    
    // Create the first area
    await throwTE(
      Test.ctx.db.save(AreaEntity, {
        label: "Existing Area",
        slug: existingSlug,
        draft: false,
        body: [],
        geometry: {
          type: "Point",
          coordinates: [10.0, 20.0],
        },
      }),
    );

    // Try to create another area with the same slug
    const newAreaData = {
      label: "Duplicate Slug Area",
      slug: existingSlug,
      draft: false,
      body: "This should return the existing area",
      geometry: {
        type: "Point" as const,
        coordinates: [15.0, 25.0],
      },
    };

    const result = await pipe(
      createAreaToolTask(newAreaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    // Should return the existing area
    expect(result.content[0].text).toContain("Existing Area");
  });

  test("Should create area with different coordinates", async () => {
    const newAreaData = {
      label: "Tokyo Area",
      slug: "tokyo-area",
      draft: false,
      body: "Tokyo location",
      geometry: {
        type: "Point" as const,
        coordinates: [139.6917, 35.6895], // Tokyo coordinates
      },
    };

    const result = await pipe(
      createAreaToolTask(newAreaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create area with detailed body content", async () => {
    const newAreaData = {
      label: "Detailed Area",
      slug: "detailed-area-001",
      draft: false,
      body: "This is a comprehensive description of the area with multiple details about its geography, history, and significance.",
      geometry: {
        type: "Point" as const,
        coordinates: [2.3522, 48.8566], // Paris coordinates
      },
    };

    const result = await pipe(
      createAreaToolTask(newAreaData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
