import { fc } from "@econnessione/core/tests";
import { GroupMemberArb } from "@econnessione/shared/tests";
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
import { UncategorizedV2Arb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";

describe("Search Events V2", () => {
  let appTest: AppTest, authorizationToken: string, totalEvents: number;
  const [actor] = fc.sample(ActorArb, 1);
  const groups = fc.sample(GroupArb, 10);
  const [groupMember] = fc.sample(GroupMemberArb, 1).map((gm) => ({
    ...gm,
    actor: actor,
    group: groups[0],
  }));
  const eventsData = fc.sample(UncategorizedV2Arb, 100).map((e) => ({
    ...e,
    media: [],
    links: [],
    topics: [],
    groups: [],
    actors: [],
    groupsMembers: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [actor] as any[])();
    await appTest.ctx.db.save(GroupEntity, groups as any[])();
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
        groups: [groups[0]],
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

  // describe("All events", () => {

  // });

  test("Get events for given actor", async () => {
    const response = await appTest.req
      .get(`/v1/events/search-v2`)
      .query({ "actors[]": actor.id })
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);
    expect(total).toBe(10);
    expect(response.body.data[0]).toMatchObject({
      actors: [actor.id],
    });
  });

  test("Get events for given group", async () => {
    const response = await appTest.req
      .get(`/v1/events/search-v2`)
      .query({ "groups[]": groups[0].id })
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    expect(response.body.data[0]).toMatchObject({
      groups: [groups[0].id],
    });
  });

  test("Should return events for given group member", async () => {
    const response = await appTest.req
      .get(`/v1/events/search-v2`)
      .query({ "groupsMembers[]": groupMember.id })
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.total).toBe(10);
    expect(response.body.data[0]).toMatchObject({
      groupsMembers: [groupMember.id],
    });
  });

  jest.setTimeout(10 * 1000);
  test("Should return all the events", async () => {
    const response = await appTest.req
      .get(`/v1/events/search-v2`)
      .set("Authorization", authorizationToken);

    const { totals } = response.body;

    expect(response.status).toEqual(200);

    expect(totals.events).toBe(totalEvents);
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      EventEntity,
      eventsData.map((e) => e.id)
    )();
    await appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(
      GroupEntity,
      groups.map((g) => g.id)
    )();
    await appTest.ctx.db.close()();
  });
});
