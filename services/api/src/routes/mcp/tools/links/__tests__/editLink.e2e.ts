import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import {
  toKeywordEntity,
  toLinkEntity,
  toMediaEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { editLinkToolTask } from "../editLink.tool.js";

describe("MCP EDIT_LINK Tool", () => {
  let Test: AppTest;
  let linkToEdit: LinkEntity;
  let testEvent: EventV2Entity;
  let testKeyword: KeywordEntity;
  let testMedia: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test data
    linkToEdit = toLinkEntity({
      ...fc.sample(LinkArb, 1)[0],
      title: "Link To Edit",
      events: [],
      image: undefined,
    });

    const media = fc.sample(MediaArb, 1).map(toMediaEntity);
    testMedia = media[0];

    const events = fc.sample(UncategorizedArb, 1).map((e) => ({
      ...e,
      links: [],
      media: [],
      keywords: [],
      socialPosts: [],
      actors: [],
      stories: [],
      groups: [],
      location: null,
      deletedAt: null,
    }));
    testEvent = events[0];

    const keywords = fc.sample(KeywordArb, 1).map(toKeywordEntity);
    testKeyword = keywords[0];

    await throwTE(Test.ctx.db.save(LinkEntity, [linkToEdit]));
    await throwTE(Test.ctx.db.save(MediaEntity, media));
    await throwTE(Test.ctx.db.save(EventV2Entity, events));
    await throwTE(Test.ctx.db.save(KeywordEntity, keywords));
  });

  test("Should edit link title", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        title: "Updated Link Title",
        url: undefined,
        description: undefined,
        publishDate: undefined,
        provider: undefined,
        image: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content.text).toContain("Updated Link Title");
  });

  test("Should edit link URL", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        url: "https://updated-example.com",
        title: undefined,
        description: undefined,
        publishDate: undefined,
        provider: undefined,
        image: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit link description", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        description: "Updated description text",
        url: undefined,
        title: undefined,
        publishDate: undefined,
        provider: undefined,
        image: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit link publishDate", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        publishDate: "2024-01-15",
        url: undefined,
        title: undefined,
        description: undefined,
        provider: undefined,
        image: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit link provider", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        provider: "New Provider",
        url: undefined,
        title: undefined,
        description: undefined,
        publishDate: undefined,
        image: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit link image", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        image: testMedia.id,
        url: undefined,
        title: undefined,
        description: undefined,
        publishDate: undefined,
        provider: undefined,
        events: [],
        keywords: [],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit link events and keywords", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        events: [testEvent.id],
        keywords: [testKeyword.id],
        url: undefined,
        title: undefined,
        description: undefined,
        publishDate: undefined,
        provider: undefined,
        image: undefined,
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should edit multiple fields at once", async () => {
    const result = await pipe(
      editLinkToolTask({
        id: linkToEdit.id,
        title: "Complete Update",
        description: "Fully updated description",
        url: "https://complete-update.com",
        publishDate: "2024-03-20",
        provider: "Complete Provider",
        image: testMedia.id,
        events: [testEvent.id],
        keywords: [testKeyword.id],
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain("Complete Update");
  });
});
