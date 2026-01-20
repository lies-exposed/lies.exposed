import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { UNCATEGORIZED } from "@liexp/io/lib/http/Events/EventType.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";
import { type ServerContext } from "../../../context/context.type.js";
import { MakeLinkGroupEventsRoute } from "../linkGroupEvents.controller.js";

// Helper to create and save events of UNCATEGORIZED type (which supports groups)
const createAndSaveEvents = async (
  ctx: ServerContext,
  groupId: UUID,
  count = 2,
) => {
  // Use UNCATEGORIZED type as it supports groups in payload
  const EventArb = getEventArbitrary(UNCATEGORIZED.literals[0]);
  const events = tests.fc.sample(EventArb, count).map((e) => ({
    ...e,
    groups: [{ id: groupId }],
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

describe(MakeLinkGroupEventsRoute.name, () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  let group: any;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    group = tests.fc.sample(GroupArb, 1)[0];
    await throwTE(
      Test.ctx.db.save(GroupEntity, [{ ...group, members: [], avatar: null }]),
    );
  });

  test("should return 401 if not authenticated", async () => {
    const res = await Test.req
      .post(`/v1/groups/${group.id}/events`)
      .send({ eventIds: ["fake-event-id"] });

    expect(res.status).toBe(401);
  });

  test("should link events to group and return linked/failed", async () => {
    // Create events
    const events = await createAndSaveEvents(Test.ctx, group.id, 2);
    // Link events
    const res = await Test.req
      .post(`/v1/groups/${group.id}/events`)
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
      .post(`/v1/groups/${group.id}/events`)
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
