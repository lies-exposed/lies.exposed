import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { UncategorizedArb } from "@liexp/shared/lib/tests/arbitrary/events/Uncategorized.arbitrary.js";
import { GroupMemberArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test/lib/index.js";
import * as A from "fp-ts/lib/Array.js";
import jwt from "jsonwebtoken";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Search Events", () => {
  let appTest: AppTest, authorizationToken: string, totalEvents: number;
  const [firstActor, secondActor] = fc.sample(ActorArb, 2);
  const groups = fc.sample(GroupArb, 10);

  const [groupMember] = fc.sample(GroupMemberArb, 1).map((gm) => ({
    ...gm,
    actor: firstActor,
    group: groups[0],
  }));

  const eventsData = fc.sample(UncategorizedArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
  }));

  let events: any[];

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(
      appTest.ctx.db.save(ActorEntity, [firstActor, secondActor] as any[]),
    );

    await throwTE(appTest.ctx.db.save(GroupEntity, groups as any[]));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[]),
    );
    const groupMemberEvents = pipe(
      eventsData,
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          groupsMembers: [groupMember.id],
        },
      })),
    );
    const firstActorEvents = pipe(
      eventsData,
      A.takeRight(90),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors: [firstActor.id],
        },
      })),
    );
    const secondActorEvents = pipe(
      eventsData,
      A.takeRight(80),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors: [secondActor.id],
        },
      })),
    );
    const groupEvents = pipe(
      eventsData,
      A.takeRight(70),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          groups: [groups[0].id],
        },
      })),
    );

    events = [
      ...groupMemberEvents,
      ...firstActorEvents,
      ...secondActorEvents,
      ...groupEvents,
    ];

    await throwTE(appTest.ctx.db.save(EventV2Entity, events));

    totalEvents = await throwTE(appTest.ctx.db.count(EventV2Entity));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET,
    )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        EventV2Entity,
        events.map((e) => e.id),
      ),
    );
    await throwTE(appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id]));
    await throwTE(
      appTest.ctx.db.delete(ActorEntity, [firstActor.id, secondActor.id]),
    );
    await throwTE(
      appTest.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id),
      ),
    );
    await appTest.utils.e2eAfterAll();
  });

  describe("Search by actors", () => {
    test("Get events for given actor", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "actors[]": firstActor.id })
        .set("Authorization", authorizationToken);

      const { totals } = response.body;

      expect(response.status).toEqual(200);
      // events include also events where actor is a group member
      expect(totals.uncategorized).toBeGreaterThanOrEqual(10);
      // expect(response.body.data[0]).toMatchObject({
      //   payload: {
      //     actors: [firstActor.id],
      //   },
      // });
    });

    test("Get events for given actors", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ actors: [firstActor.id, secondActor.id] })
        .set("Authorization", authorizationToken);

      const { totals } = response.body;

      expect(response.status).toEqual(200);
      expect(totals.uncategorized).toBe(20);
    });
  });

  describe("Search by groups", () => {
    test("Get events for given group", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "groups[]": groups[0].id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);

      expect(response.body.data[0]).toMatchObject({
        payload: {
          groups: [groups[0].id],
        },
      });
    });
  });

  describe("Search by group member", () => {
    test("Should return events for given group member", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "groupsMembers[]": groupMember.id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);
      expect(response.body.totals.uncategorized).toBe(10);
      expect(response.body.data[0]).toMatchObject({
        payload: {
          groupsMembers: [groupMember.id],
        },
      });
    });
  });

  test("Should return all the events", async () => {
    const response = await appTest.req
      .get(`/v1/events`)
      .set("Authorization", authorizationToken);

    const { totals } = response.body;

    expect(response.status).toEqual(200);

    expect(totals.uncategorized).toBeLessThanOrEqual(totalEvents);
  });
});
