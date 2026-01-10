import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";
import { type ServerContext } from "../../../context/context.type.js";
import { MakeLinkActorEventsRoute } from "../linkActorEvents.controller.js";

// Helper to create and save events of a given type
const createAndSaveEvents = async (
  ctx: ServerContext,
  actorId: UUID,
  count = 2,
) => {
  const EventArb = getEventArbitrary(UNCATEGORIZED.literals[0]);
  const events = tests.fc.sample(EventArb, count).map((e) => ({
    ...e,
    actors: [{ id: actorId }],
    // ensure required fields
    socialPosts: [],
    media: [],
    links: [],
    keywords: [],
    stories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));
  await throwTE(ctx.db.save(EventV2Entity, events));
  return events;
};

describe(MakeLinkActorEventsRoute.name, () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  let actor: any;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    actor = tests.fc.sample(ActorArb, 1)[0];
    await throwTE(
      Test.ctx.db.save(ActorEntity, [
        { ...actor, nationalities: [], avatar: null },
      ]),
    );
  });

  test("should return 401 if not authenticated", async () => {
    const res = await Test.req
      .post(`/v1/actors/${actor.id}/events`)
      .send({ eventIds: ["fake-event-id"] });

    expect(res.status).toBe(401);
  });

  test("should link events to actor and return linked/failed", async () => {
    // Create events
    const events = await createAndSaveEvents(Test.ctx, actor.id, 2);
    // Link events
    const res = await Test.req
      .post(`/v1/actors/${actor.id}/events`)
      .set("Authorization", authorizationToken)
      .send({ eventIds: events.map((e) => e.id) });

    expect(res.status).toBe(200);
    expect(res.body.data.linked).toEqual(
      expect.arrayContaining(events.map((e) => e.id)),
    );
    expect(res.body.data.failed).toEqual([]);
  });

  test("should return failed for non-existent event IDs", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await Test.req
      .post(`/v1/actors/${actor.id}/events`)
      .set("Authorization", authorizationToken)
      .send({ eventIds: [fakeId] });

    expect(res.status).toBe(200);
    expect(res.body.data.linked).toEqual([]);
    expect(res.body.data.failed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventId: fakeId,
          reason: expect.any(String),
        }),
      ]),
    );
  });
});
