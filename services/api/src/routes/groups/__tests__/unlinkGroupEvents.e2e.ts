import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { UNCATEGORIZED } from "@liexp/io/lib/http/Events/EventType.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Unlink Group Events", () => {
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

  test("Should return a 401 when unlinking without token", async () => {
    const fakeEventId = "00000000-0000-0000-0000-000000000000";

    await Test.req
      .delete(`/v1/groups/${group.id}/events/${fakeEventId}`)
      .expect(401);
  });

  test("Should unlink group from event", async () => {
    // create an event containing the group
    const EventArb = getEventArbitrary(UNCATEGORIZED.literals[0]);
    const sampleEvent = tests.fc.sample(EventArb, 1)[0];
    const event = {
      ...sampleEvent,
      payload: { ...(sampleEvent.payload ?? {}), groups: [group.id] },
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

    // ensure event has group
    const savedRows: any[] = await Test.ctx.db.manager.query(
      `SELECT payload FROM event_v2 WHERE id = $1`,
      [event.id],
    );
    expect(savedRows.length).toBeGreaterThan(0);
    expect(JSON.stringify(savedRows[0].payload)).toContain(group.id);

    // unlink
    const res = await Test.req
      .delete(`/v1/groups/${group.id}/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .expect(200);

    expect(res.body.data).toMatchObject({ success: true });

    const updatedRows: any[] = await Test.ctx.db.manager.query(
      `SELECT payload FROM event_v2 WHERE id = $1`,
      [event.id],
    );
    expect(updatedRows.length).toBeGreaterThan(0);
    expect(JSON.stringify(updatedRows[0].payload)).not.toContain(group.id);
  });
});
