import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { UserArb } from "@liexp/test/lib/arbitrary/User.arbitrary.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createLinkToolTask } from "../createLink.tool.js";

describe("MCP CREATE_LINK Tool", () => {
  let Test: AppTest;
  let testUser: UserEntity;
  let testEvent: EventV2Entity;

  beforeAll(async () => {
    Test = await GetAppTest();

    const users = fc.sample(UserArb, 1).map(
      (u): UserEntity => ({
        ...u,
        permissions: [],
        passwordHash: "testpasswordhash",
        links: [],
        media: [],
        stories: [],
        graphs: [],
        eventSuggestions: [],
        deletedAt: null,
      }),
    );
    testUser = users[0];

    const events = fc
      .sample(getEventArbitrary("Uncategorized"), 1)
      .map((e) => ({
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

    await throwTE(Test.ctx.db.save(UserEntity, users));
    await throwTE(Test.ctx.db.save(EventV2Entity, events));
  });

  test("Should create a new link with required fields", async () => {
    const newLinkData = {
      url: "https://example.com/test-link",
      title: "Test Link",
      publishDate: undefined,
      description: undefined,
      events: [],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toHaveProperty("text");
    expect(content.text).toContain(newLinkData.title);
  });

  test("Should create link with publishDate", async () => {
    const newLinkData = {
      url: "https://example.com/dated-link",
      title: "Dated Link",
      publishDate: "2024-01-15",
      description: undefined,
      events: [],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create link with description", async () => {
    const newLinkData = {
      url: "https://example.com/described-link",
      title: "Link with Description",
      publishDate: undefined,
      description: "This is a detailed description of the link",
      events: [],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create link associated with events", async () => {
    const newLinkData = {
      url: "https://example.com/event-link",
      title: "Event Associated Link",
      publishDate: undefined,
      description: undefined,
      events: [testEvent.id],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create link with all optional fields", async () => {
    const newLinkData = {
      url: "https://example.com/complete-link",
      title: "Complete Link",
      publishDate: "2024-03-20",
      description: "A complete link with all fields filled",
      events: [testEvent.id],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });

  test("Should create link without description and publishDate", async () => {
    const newLinkData = {
      url: "https://example.com/minimal-link",
      title: "Minimal Link",
      publishDate: undefined,
      description: undefined,
      events: [],
      creatorId: testUser.id,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
