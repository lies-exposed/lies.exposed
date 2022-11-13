import { http } from "@liexp/shared/io";
import { LinkArb, UncategorizedArb } from "@liexp/shared/tests";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as tests from "@liexp/test";
import { AppTest, GetAppTest } from "../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";

describe("List Links", () => {
  let Test: AppTest, authorizationToken: string, links: http.Link.Link[];
  beforeAll(async () => {
    Test = GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    links = tests.fc.sample(LinkArb, 10).map((a) => ({
      ...a,
      events: [],
      keywords: [],
    }));

    links = await throwTE<any, any>(
      Test.ctx.db.save(LinkEntity, links as any[])
    );
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        LinkEntity,
        links.map((a) => a.id)
      )
    );
    await throwTE(Test.ctx.db.close());
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
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events as any));

      const response = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          emptyEvents: "true",
        });

      await throwTE(
        Test.ctx.db.delete(
          EventV2Entity,
          events.map((e) => e.id)
        )
      );

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
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events as any));

      const response = await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          "events[]": [events[0].id],
        });

      await throwTE(
        Test.ctx.db.delete(
          EventV2Entity,
          events.map((e) => e.id)
        )
      );

      const data = response.body.data;

      expect(data.length).toBe(1);
    });
  });
});
