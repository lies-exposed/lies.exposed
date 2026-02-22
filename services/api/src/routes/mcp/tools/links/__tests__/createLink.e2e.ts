import { randomUUID } from "crypto";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createLinkToolTask } from "../createLink.tool.js";

describe("MCP CREATE_LINK Tool", () => {
  let Test: AppTest;
  let testEvent: EventV2Entity;
  const testSuiteId = randomUUID();

  beforeAll(async () => {
    Test = await GetAppTest();

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

    await throwTE(Test.ctx.db.save(EventV2Entity, events));
  });

  test("Should create a new link with required fields", async () => {
    const newLinkData = {
      url: `https://example.com/createlink/${testSuiteId}/test-link`,
      title: "Test Link",
      publishDate: undefined,
      description: undefined,
      events: [],
      status: undefined,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);

    const content = result.content[0];
    expect(content).toMatchObject({
      type: "text",
      text: expect.stringContaining(newLinkData.title),
    });
  });

  test("Should create link with publishDate", async () => {
    const newLinkData = {
      url: `https://example.com/createlink/${testSuiteId}/dated-link`,
      title: "Dated Link",
      publishDate: "2024-01-15",
      description: undefined,
      events: [],
      status: undefined,
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
      url: `https://example.com/createlink/${testSuiteId}/described-link`,
      title: "Link with Description",
      publishDate: undefined,
      description: "This is a detailed description of the link",
      events: [],
      status: undefined,
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
      url: `https://example.com/createlink/${testSuiteId}/event-link`,
      title: "Event Associated Link",
      publishDate: undefined,
      description: undefined,
      events: [testEvent.id],
      status: undefined,
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
      url: `https://example.com/createlink/${testSuiteId}/complete-link`,
      title: "Complete Link",
      publishDate: "2024-03-20",
      description: "A complete link with all fields filled",
      events: [testEvent.id],
      status: undefined,
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
      url: `https://example.com/createlink/${testSuiteId}/minimal-link`,
      title: "Minimal Link",
      publishDate: undefined,
      description: undefined,
      events: [],
      status: undefined,
    };

    const result = await pipe(
      createLinkToolTask(newLinkData),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
  });
});
