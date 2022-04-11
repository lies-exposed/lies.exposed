import { EventV2Entity } from "@entities/Event.v2.entity";
import { MediaEntity } from "@entities/Media.entity";
import * as tests from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { MediaArb, UncategorizedArb } from "@liexp/shared/tests";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("List Media", () => {
  let Test: AppTest,
    authorizationToken: string,
    media: http.Media.Media[],
    event: http.Events.Event;
  beforeAll(async () => {
    Test = await initAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    media = tests.fc.sample(MediaArb, 100);

    await Test.ctx.db.save(
      MediaEntity,
      media.map((a) => ({
        ...(a as any),
      }))
    )();

    [event] = tests.fc.sample(UncategorizedArb, 1);

    await Test.ctx.db.save(EventV2Entity, [
      { ...event, links: [], media: [{ id: media[0].id }], keywords: [] },
    ])();
  });

  afterAll(async () => {
    await Test.ctx.db.delete(
      EventV2Entity,
      [event].map((e) => e.id)
    )();

    await Test.ctx.db.delete(
      MediaEntity,
      media.map((a) => a.id)
    )();
    await Test.ctx.db.close()();
  });

  test("Should list media", async () => {
    const response = await Test.req
      .get("/v1/media")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.total).toBeGreaterThanOrEqual(100);
  });

  test("Should list media by event id", async () => {
    const response = await Test.req
      .get("/v1/media")
      .query({ "events[]": event.id })
      .set("Authorization", authorizationToken);

    const { updatedAt, createdAt, ...expectedMedia } = media[0];

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0]).toMatchObject({
      ...expectedMedia,
      events: [event.id],
    });
  });
});
