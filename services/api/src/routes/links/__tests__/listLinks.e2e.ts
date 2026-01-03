import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { toLinkEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Links", () => {
  let Test: AppTest,
    authorizationToken: string,
    links = tests.fc.sample(LinkArb, 10).map(toLinkEntity);

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    links = await throwTE(Test.ctx.db.save(LinkEntity, links));
  });

  test("Should return links", async () => {
    const response = await Test.req
      .get("/v1/links")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(10);
  });

  describe("Links events", () => {
    test("Should return an empty list with 'emptyEvents' query", async () => {
      const events = tests.fc.sample(UncategorizedArb, 1).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [{ id: links[0].id }],
        socialPosts: [],
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events));

      const response = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          emptyEvents: "true",
        });

      const data = response.body.data;

      expect(data.length).toBeGreaterThanOrEqual(9);
    });

    test("Should return the event link list", async () => {
      const events = tests.fc.sample(UncategorizedArb, 10).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [{ id: links[0].id }],
        socialPosts: [],
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events));

      const response = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          "events[]": [events[0].id],
        });

      const data = response.body.data;

      expect(data.length).toBe(1);
    });

    test("Should filter links by minimum events count", async () => {
      // Create test links with varying numbers of events
      const testLinks = tests.fc.sample(LinkArb, 3).map(toLinkEntity);
      const savedLinks = await throwTE(Test.ctx.db.save(LinkEntity, testLinks));

      // Link 0: No events
      // Link 1: 2 events
      const eventsFor1 = tests.fc.sample(UncategorizedArb, 2).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [{ id: savedLinks[1].id }],
        socialPosts: [],
      }));

      // Link 2: 5 events
      const eventsFor2 = tests.fc.sample(UncategorizedArb, 5).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [{ id: savedLinks[2].id }],
        socialPosts: [],
      }));

      await throwTE(
        Test.ctx.db.save(EventV2Entity, [...eventsFor1, ...eventsFor2]),
      );

      // Test filter with eventsCount=3, should only return link with 5 events
      const response1 = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          eventsCount: "3",
        });

      expect(response1.status).toBe(200);
      const filteredLinks = response1.body.data.filter((l: any) =>
        [savedLinks[0].id, savedLinks[1].id, savedLinks[2].id].includes(l.id),
      );
      expect(filteredLinks.length).toBe(1);
      expect(filteredLinks[0].id).toBe(savedLinks[2].id);

      // Test filter with eventsCount=2, should return both links with 2 and 5 events
      const response2 = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          eventsCount: "2",
        });

      expect(response2.status).toBe(200);
      const filteredLinks2 = response2.body.data.filter((l: any) =>
        [savedLinks[0].id, savedLinks[1].id, savedLinks[2].id].includes(l.id),
      );
      expect(filteredLinks2.length).toBe(2);
      expect(filteredLinks2.map((l: any) => l.id).sort()).toEqual(
        [savedLinks[1].id, savedLinks[2].id].sort(),
      );

      // Test filter with eventsCount=1, should return both links with events
      const response3 = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          eventsCount: "1",
        });

      expect(response3.status).toBe(200);
      const filteredLinks3 = response3.body.data.filter((l: any) =>
        [savedLinks[0].id, savedLinks[1].id, savedLinks[2].id].includes(l.id),
      );
      expect(filteredLinks3.length).toBe(2);
    });
  });
});
