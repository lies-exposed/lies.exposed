import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { type Uncategorized } from "@liexp/shared/lib/io/http/Events/Uncategorized.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Media", () => {
  let Test: AppTest, authorizationToken: string, event: Uncategorized;
  const media = tests.fc.sample(MediaArb, 100).map((m) => ({
    ...m,
    location: m.location + `?timestapm=${new Date().toISOString()}`,
    creator: undefined,
    events: [],
    links: [],
    keywords: [],
    areas: [],
    socialPosts: [],
    featuredInStories: [],
  }));
  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;

    await throwTE(Test.ctx.db.save(MediaEntity, media));

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
      updatedAt: _updatedAt,
      createdAt: _createdAt,
      deletedAt: _deletedAt,
      extra: _extra,
      description: _description,
      label: _label,
      socialPosts: _socialPosts,
      ...expectedMedia
    } = media[0];

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
