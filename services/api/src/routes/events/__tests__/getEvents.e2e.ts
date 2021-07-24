import { fc } from "@econnessione/core/tests";
import { EventArb, GroupMemberArb } from "@econnessione/shared/tests";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventEntity } from "../../../entities/Event.entity";
import { GroupMemberEntity } from "../../../entities/GroupMember.entity";

describe("Get Events", () => {
  let appTest: AppTest, authorizationToken: string, totalEvents: number;
  const [groupMember] = fc.sample(GroupMemberArb, 1);
  const eventData = fc.sample(EventArb, 10).map((e) => ({
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

    await appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])();
    await appTest.ctx.db.save(EventEntity, eventData.map(e => ({ ...e, groupMember: [groupMember.id]})) as any[])();

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
      eventData.map((e) => e.id)
    )();
    await appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id])();
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

  test("Should return events for given group member", async () => {
    const response = await appTest.req
      .get(`/v1/events`)
      .query({ groupMember: groupMember.id })
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);
    expect(total).toBe(totalEvents);
  });

  describe('Actor', () => {
    test.todo('Get events for given actor')
  })

  describe('Group', () => {
    test.todo('Get events for given group')
  })

  describe('Group Member', () => {
    test.todo('Get events for given group member')
  })
});
