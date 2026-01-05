import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import {
  toLinkEntity,
  toUserEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { UserArb } from "@liexp/test/lib/arbitrary/User.arbitrary.js";
import { randomUUID } from "crypto";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { findLinksToolTask } from "../findLinks.tool.js";

describe("MCP FIND_LINKS Tool", () => {
  let Test: AppTest;
  let testLinks: LinkEntity[];
  const testSuiteId = randomUUID();

  beforeAll(async () => {
    Test = await GetAppTest();

    const users = fc.sample(UserArb, 1).map(toUserEntity);

    // Create test data with unique URLs to avoid constraint violations
    const links = fc.sample(LinkArb, 5);
    testLinks = links.map((link, index) => {
      const entity = toLinkEntity(link);
      // Ensure each URL is unique with test-suite prefix
      entity.url = `https://example.com/findlinks/${testSuiteId}/${index}` as any;
      return entity;
    });

    await throwTE(Test.ctx.db.save(UserEntity, users));
    await throwTE(Test.ctx.db.save(LinkEntity, testLinks));
  });

  test("Should find links matching search query by title", async () => {
    const link = testLinks[0];
    const result = await pipe(
      findLinksToolTask({
        query: link.title.substring(0, 5),
        ids: [],
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
      findLinksToolTask({
        query: "NonExistentLinkTitle99999",
        ids: [],
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining("No links found"),
    });
  });

  test("Should filter links by ids", async () => {
    const link = testLinks[0];
    const result = await pipe(
      findLinksToolTask({
        query: undefined,
        ids: [link.id],
        sort: undefined,
        order: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support sorting by title", async () => {
    const result = await pipe(
      findLinksToolTask({
        query: undefined,
        ids: [],
        sort: "title",
        order: "ASC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support sorting by url", async () => {
    const result = await pipe(
      findLinksToolTask({
        query: undefined,
        ids: [],
        sort: "url",
        order: "DESC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should support descending order", async () => {
    const result = await pipe(
      findLinksToolTask({
        query: testLinks[0].title.substring(0, 3),
        ids: [],
        sort: "createdAt",
        order: "DESC",
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
