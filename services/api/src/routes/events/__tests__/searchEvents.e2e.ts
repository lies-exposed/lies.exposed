import { GroupMemberArb } from "@liexp/shared/tests";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { UncategorizedArb } from "@liexp/shared/tests/arbitrary/Event.arbitrary";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import jwt from "jsonwebtoken";
import { AppTest, GetAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

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

  beforeAll(async () => {
    appTest = GetAppTest();

    await throwTE(
      appTest.ctx.db.save(ActorEntity, [firstActor, secondActor] as any[])
    );

    await throwTE(appTest.ctx.db.save(GroupEntity, groups as any[]));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])
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
      }))
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
      }))
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
      }))
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
      }))
    );

    const events: any[] = [
      ...groupMemberEvents,
      ...firstActorEvents,
      ...secondActorEvents,
      ...groupEvents,
    ];

    await throwTE(appTest.ctx.db.save(EventV2Entity, events));

    totalEvents = await throwTE(appTest.ctx.db.count(EventV2Entity));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
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
      expect(totals.uncategorized).toBeGreaterThanOrEqual(20);
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
      expect(totals.uncategorized).toBe(30);
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

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        EventV2Entity,
        eventsData.map((e) => e.id)
      )
    );
    await throwTE(appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id]));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [firstActor.id]));
    await throwTE(
      appTest.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id)
      )
    );
    await throwTE(appTest.ctx.db.close());
  });
});
