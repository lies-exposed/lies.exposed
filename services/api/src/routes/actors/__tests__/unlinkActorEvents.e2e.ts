import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { UNCATEGORIZED } from "@liexp/io/lib/http/Events/EventType.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Unlink Actor Events", () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  const [avatar] = tests.fc.sample(MediaArb, 1);
  const actor = tests.fc.sample(ActorArb, 1).map((a) => ({
    ...a,
    death: undefined,
    memberIn: [],
    avatar,
  }))[0];

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    await pipe(
      Test.ctx.db.save(MediaEntity, [
        {
          ...avatar,
          events: [],
          links: [],
          keywords: [],
          stories: [],
          socialPosts: [],
          areas: [],
          featuredInAreas: [],
          featuredInStories: [],
          creator: null,
        },
      ]),
      throwTE,
    );

    await throwTE(
      Test.ctx.db.save(ActorEntity, [
        {
          ...actor,
          nationalities: [],
          avatar: actor.avatar?.id,
        },
      ]),
    );
  });

  test("Should return a 401 when unlinking without token", async () => {
    const fakeEventId = "00000000-0000-0000-0000-000000000000";

    await Test.req
      .delete(`/v1/actors/${actor.id}/events/${fakeEventId}`)
      .expect(401);
  });

  test("Should unlink actor from event", async () => {
    // create an event containing the actor
    const EventArb = getEventArbitrary(UNCATEGORIZED.literals[0]);
    const sampleEvent = tests.fc.sample(EventArb, 1)[0];
    const event = {
      ...sampleEvent,
      payload: { ...(sampleEvent.payload ?? {}), actors: [actor.id] },
      socialPosts: [],
      media: [],
      links: [],
      keywords: [],
      stories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    };

    await throwTE(Test.ctx.db.save(EventV2Entity, [event]));

    // ensure event has actor
    const savedRows: any[] = await Test.ctx.db.manager.query(
      `SELECT payload FROM event_v2 WHERE id = $1`,
      [event.id],
    );
    expect(savedRows.length).toBeGreaterThan(0);
    expect(JSON.stringify(savedRows[0].payload)).toContain(actor.id);

    // unlink
    const res = await Test.req
      .delete(`/v1/actors/${actor.id}/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .expect(200);

    expect(res.body.data).toMatchObject({ success: true });

    const updatedRows: any[] = await Test.ctx.db.manager.query(
      `SELECT payload FROM event_v2 WHERE id = $1`,
      [event.id],
    );
    expect(updatedRows.length).toBeGreaterThan(0);
    expect(JSON.stringify(updatedRows[0].payload)).not.toContain(actor.id);
  });
});
