import * as tests from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { MediaArb, UncategorizedArb } from "@liexp/shared/tests";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { MediaEntity } from "@entities/Media.entity";

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

    media = tests.fc.sample(MediaArb, 100).map((m) => ({
      ...m,
      creator: undefined,
    }));

    await throwTE(Test.ctx.db.save(MediaEntity, media as any[]));

    [event] = tests.fc.sample(UncategorizedArb, 1);

    await throwTE(
      Test.ctx.db.save(EventV2Entity, [
        { ...event, links: [], media: [{ id: media[0].id }], keywords: [] },
      ])
    );
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        EventV2Entity,
        [event].map((e) => e.id)
      )
    );

    await throwTE(
      Test.ctx.db.delete(
        MediaEntity,
        media.map((a) => a.id)
      )
    );
    await throwTE(Test.ctx.db.close());
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

    const { updatedAt, createdAt, deletedAt, ...expectedMedia } =
      media[0] as any;

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBe(1);
    expect({
      ...response.body.data[0],
      creator: response.body.data[0].creator,
    }).toMatchObject({
      ...expectedMedia,
      events: [event.id],
    });
  });
});
