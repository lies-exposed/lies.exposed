import * as tests from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { LinkArb, UncategorizedArb } from "@liexp/shared/tests";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";

describe.skip("List Links", () => {
  let Test: AppTest, authorizationToken: string, links: http.Link.Link[];
  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    links = tests.fc.sample(LinkArb, 100).map((a) => ({
      ...a,
      events: [],
      keywords: [],
    }));

    await Test.ctx.db.save(LinkEntity, links as any[])();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(
      LinkEntity,
      links.map((a) => a.id)
    )();
    await Test.ctx.db.close()();
  });

  test("Should return links", async () => {
    const response = await Test.req
      .get("/v1/actors")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
  });

  describe("Links events", () => {
    test("Should return the event link list", async () => {
      const events = tests.fc.sample(UncategorizedArb, 10).map((e) => ({
        ...e,
        links: [links[0]],
      }));

      await Test.ctx.db.save(EventV2Entity, events as any)();

      await Test.req
        .get("/v1/links")
        .set("Authorization", authorizationToken)
        .query({
          events: [],
        });
    });
  });
});
