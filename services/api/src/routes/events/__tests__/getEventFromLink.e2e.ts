import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import {
  ActorArb,
  GroupArb,
  GroupMemberArb,
  UncategorizedArb
} from "@liexp/shared/tests";
import fc from "fast-check";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Get event from link", () => {
  let appTest: AppTest;
  const [firstActor, secondActor] = fc.sample(ActorArb, 2);
  const groups = fc.sample(GroupArb, 2);
  const groupsMembers = fc.sample(GroupMemberArb, 2).map((gm, i) => ({
    ...gm,
    actor: firstActor.id,
    group: groups[i].id,
  }));
  const eventTitle = "very complicated title with long words like this one: supercalifragilistichespiralidoso";
  const eventsData = fc.sample(UncategorizedArb, 2).map((e) => ({
    ...e,
    payload: {
      ...e.payload,
      title: eventTitle,
      actors: [firstActor.id],
      groups: groups.map((g) => g.id),
      location: undefined,
      groupsMembers: [groupsMembers[0].id],
    },
    keywords: [],
    links: [],
    media: [],
  }));
  // authorizationToken: string,
  // totalEvents: number;

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [
      firstActor,
      secondActor,
    ] as any[])();
    await appTest.ctx.db.save(GroupEntity, groups as any[])();
    await appTest.ctx.db.save(GroupMemberEntity, groupsMembers as any[])();

    const events = [...eventsData];

    await appTest.ctx.db.save(EventV2Entity, events as any[])();

    // totalEvents = await appTest.ctx.db
    //   .count(EventV2Entity)()
    //   .then((result) => (result as any).right);

    // authorizationToken = `Bearer ${jwt.sign(
    //   { id: "1" },
    //   appTest.ctx.env.JWT_SECRET
    // )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      EventV2Entity,
      eventsData.map((e) => e.id)
    )();
    await appTest.ctx.db.delete(
      GroupMemberEntity,
      groupsMembers.map((d) => d.id)
    )();
    await appTest.ctx.db.delete(ActorEntity, [firstActor.id])();
    await appTest.ctx.db.delete(
      GroupEntity,
      groups.map((g) => g.id)
    )();
    await appTest.ctx.db.close()();
  });

  test("Return events sorted by score", async () => {
    appTest.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title: "complicated words",
      description: eventsData[0].payload.title,
      keywords: [],
    });
    const response = await appTest.req
      .get(`/v1/events-from-link`)
      .query({ url: "http://lies.exposed" });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      score: 100,
      ...eventsData[0],
      date: eventsData[0].date.toISOString(),
      createdAt: eventsData[0].createdAt.toISOString(),
      updatedAt: eventsData[0].updatedAt.toISOString(),
    });
  });
});
