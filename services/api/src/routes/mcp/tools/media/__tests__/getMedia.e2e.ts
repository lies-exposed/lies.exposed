import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { getMediaToolTask } from "../getMedia.tool.js";

describe("MCP GET_MEDIA Tool", () => {
  let Test: AppTest;
  let testMedia: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    const media = fc.sample(MediaArb, 1).map(toMediaEntity);
    testMedia = media[0];

    await throwTE(Test.ctx.db.save(MediaEntity, media));
  });

  test("Should get media by id", async () => {
    const result = await pipe(
      getMediaToolTask({
        id: testMedia.id,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(testMedia.label);
    expect(content).toHaveProperty("href");
    expect(content.href).toBe(`media://${testMedia.id}`);
  });

  test("Should return error for non-existent media id", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000" as UUID;

    await expect(
      pipe(
        getMediaToolTask({
          id: nonExistentId,
        }),
        throwRTE(Test.ctx),
      ),
    ).rejects.toThrow();
  });
});
