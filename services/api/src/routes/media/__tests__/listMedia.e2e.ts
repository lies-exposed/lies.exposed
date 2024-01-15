import { type http } from "@liexp/shared/lib/io/index.js";
import { MediaArb, UncategorizedArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";

describe("List Media", () => {
  let Test: AppTest,
    authorizationToken: string,
    media: http.Media.Media[],
    event: http.Events.Event;
  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    media = tests.fc.sample(MediaArb, 100).map((m) => ({
      ...m,
      location: m.location + `?timestapm=${new Date().toISOString()}`,
      creator: undefined,
    }));

    await throwTE(Test.ctx.db.save(MediaEntity, media as any[]));

    [event] = tests.fc.sample(UncategorizedArb, 1);

    await throwTE(
      Test.ctx.db.save(EventV2Entity, [
        {
          ...event,
          socialPosts: undefined,
          links: [],
          media: [{ id: media[0].id }],
          keywords: [],
        },
      ]),
    );
  });

  afterAll(async () => {
    await throwTE(
      Test.ctx.db.delete(
        EventV2Entity,
        [event].map((e) => e.id),
      ),
    );

    await throwTE(
      Test.ctx.db.delete(
        MediaEntity,
        media.map((a) => a.id),
      ),
    );

    await Test.utils.e2eAfterAll();
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

    const {
      updatedAt,
      createdAt,
      deletedAt,
      extra,
      description,
      label,
      socialPosts,
      ...expectedMedia
    } = media[0] as any;

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
