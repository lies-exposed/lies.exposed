import { fc } from "@econnessione/core/tests";
import { EventArb, GroupMemberArb } from "@econnessione/shared/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventEntity } from "../../../entities/Event.entity";
import { GroupMemberEntity } from "../../../entities/GroupMember.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

describe("Get Events", () => {
  let appTest: AppTest, authorizationToken: string, totalEvents: number;
  const [actor] = fc.sample(ActorArb, 1);
  const [group] = fc.sample(GroupArb, 1);
  const [groupMember] = fc.sample(GroupMemberArb, 1).map((gm) => ({
    ...gm,
    actor: actor,
    group: group,
  }));
  const eventsData = fc.sample(EventArb, 100).map((e) => ({
    ...e,
    images: [],
    links: [],
    topics: [],
    groups: [],
    actors: [],
    groupsMembers: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [actor] as any[])();
    await appTest.ctx.db.save(GroupEntity, [group] as any[])();
    await appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])();
    const groupMemberEvents = pipe(
      eventsData,
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        groupsMembers: [groupMember],
      }))
    );
    const actorEvents = pipe(
      eventsData,
      A.takeRight(90),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        actors: [actor],
      }))
    );
    const groupEvents = pipe(
      eventsData,
      A.takeRight(80),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        groups: [group],
      }))
    );

    const events = [...groupMemberEvents, ...actorEvents, ...groupEvents];

    await appTest.ctx.db.save(EventEntity, events as any[])();

    totalEvents = await appTest.ctx.db
      .count(EventEntity)()
      .then((result) => (result as any).right);

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      EventEntity,
      eventsData.map((e) => e.id)
    )();
    await appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should return all the events", async () => {
    const response = await appTest.req
      .get(`/v1/events`)
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);

    expect(total).toBe(totalEvents);
  });

  describe("Actor", () => {
    test("Get events for given actor", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "actors[]": actor.id })
        .set("Authorization", authorizationToken);

      const { total } = response.body;

      expect(response.status).toEqual(200);
      expect(total).toBe(10);
      expect(response.body.data[0]).toMatchObject({
        actors: [actor.id],
      });
    });
  });

  describe("Group", () => {
    test("Get events for given group", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "groups[]": group.id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);

      expect(response.body.data[0]).toMatchObject({
        groups: [group.id],
      });
    });
  });

  describe("Group Member", () => {
    test("Should return events for given group member", async () => {
      const response = await appTest.req
        .get(`/v1/events`)
        .query({ "groupsMembers[]": groupMember.id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);
      expect(response.body.total).toBe(10);
      expect(response.body.data[0]).toMatchObject({
        groupsMembers: [groupMember.id],
      });
    });
  });
});
