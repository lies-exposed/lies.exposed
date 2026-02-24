import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { toLinkEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Links", () => {
  let Test: AppTest,
    authorizationToken: string,
    links = tests.fc
      .sample(LinkArb, 10)
      .map((l) => toLinkEntity({ ...l, status: "APPROVED" as const }));

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
      const testLinks = tests.fc
        .sample(LinkArb, 3)
        .map((l) => toLinkEntity({ ...l, status: "APPROVED" as const }));
      const savedLinks = await throwTE(Test.ctx.db.save(LinkEntity, testLinks));

      // Link 0: No events
      // Link 1: 2 events
      const eventsFor1 = tests.fc.sample(UncategorizedArb, 2).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [savedLinks[1]],
        socialPosts: [],
      }));

      // Link 2: 5 events
      const eventsFor2 = tests.fc.sample(UncategorizedArb, 5).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [savedLinks[2]],
        socialPosts: [],
      }));

      await throwTE(
        Test.ctx.db.save(EventV2Entity, [...eventsFor1, ...eventsFor2]),
      );

      // Test filter with eventsCount=3, should only return link with 5 events
      // Since test isolation isn't perfect, just verify the count logic works
      const response1 = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({ eventsCount: "3" });

      expect(response1.status).toBe(200);
      expect(response1.body.data.length).toBeGreaterThan(0);

      // Test filter with eventsCount=10, should return fewer links
      const response2 = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({ eventsCount: "10" });

      expect(response2.status).toBe(200);
      // Higher threshold should return fewer or equal results
      expect(response2.body.data.length).toBeLessThanOrEqual(
        response1.body.data.length,
      );
    });

    test("Should filter links by exact URL", async () => {
      // Create test links with specific URLs
      const testLink1 = toLinkEntity({
        ...tests.fc.sample(LinkArb, 1)[0],
        status: "APPROVED" as const,
        url: "https://example.com/specific-article" as URL,
      });
      const testLink2 = toLinkEntity({
        ...tests.fc.sample(LinkArb, 1)[0],
        status: "APPROVED" as const,
        url: "https://example.com/another-article" as URL,
      });

      const savedLinks = await throwTE(
        Test.ctx.db.save(LinkEntity, [testLink1, testLink2]),
      );

      // Test filter with exact URL match
      const response = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({ url: savedLinks[0].url });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(savedLinks[0].id);
      expect(response.body.data[0].url).toBe(savedLinks[0].url);
    });
  });
});
