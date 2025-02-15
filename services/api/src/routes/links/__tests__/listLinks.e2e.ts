import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { toLinkEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
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

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
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
  });
});
