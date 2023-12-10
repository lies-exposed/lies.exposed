import {
  ActorArb,
  GroupArb,
  GroupMemberArb,
  UncategorizedArb,
} from "@liexp/shared/lib/tests";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";

describe("Get event from link", () => {
  let appTest: AppTest;
  const [firstActor, secondActor] = fc.sample(ActorArb, 2);
  const groups = fc.sample(GroupArb, 2);
  const groupsMembers = fc.sample(GroupMemberArb, 2).map((gm, i) => ({
    ...gm,
    actor: firstActor.id,
    group: groups[i].id,
  }));
  const eventTitle = "very complicated title supercalifragilistichespiralidoso";
  const eventsData = fc.sample(UncategorizedArb, 2).map((e, i) => ({
    ...e,
    date: new Date(),
    payload: {
      ...e.payload,
      title: i === 0 ? eventTitle : e.payload.title,
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
    appTest = await GetAppTest();

    await throwTE(
      appTest.ctx.db.save(ActorEntity, [firstActor, secondActor] as any[]),
    );
    await throwTE(appTest.ctx.db.save(GroupEntity, groups as any[]));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, groupsMembers as any[]),
    );

    const events = [...eventsData];

    await throwTE(appTest.ctx.db.save(EventV2Entity, events as any[]));

    // totalEvents = await appTest.ctx.db
    //   .count(EventV2Entity)()
    //   .then((result) => (result as any).right);

    // authorizationToken = `Bearer ${jwt.sign(
    //   { id: "1" },
    //   appTest.ctx.env.JWT_SECRET
    // )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        EventV2Entity,
        eventsData.map((e) => e.id),
      ),
    );
    await throwTE(
      appTest.ctx.db.delete(
        GroupMemberEntity,
        groupsMembers.map((d) => d.id),
      ),
    );
    await throwTE(appTest.ctx.db.delete(ActorEntity, [firstActor.id]));
    await throwTE(
      appTest.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id),
      ),
    );
  });

  test.skip("Return events sorted by score", async () => {
    appTest.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title:
        "very complicated title with long words like this one: supercalifragilistichespiralidoso",
      description: eventsData[0].payload.title,
      keywords: [],
      date: new Date(),
    });

    const response = await appTest.req
      .get(`/v1/events-from-link`)
      .query({ url: "http://lies.exposed" });

    const {
      deletedAt,
      payload: { location, endDate, ...expectedPayload },
      ...expectedEvent
    } = eventsData[0];

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      ...expectedEvent,
      date: expectedEvent.date.toISOString(),
      createdAt: expectedEvent.createdAt.toISOString(),
      updatedAt: expectedEvent.updatedAt.toISOString(),
    });

    expect(response.body.data[0].payload).toMatchObject(expectedPayload);
    // expect some suggestions
    expect(response.body.suggestions).toHaveLength(5);
  });
});
