import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { GroupMemberArb } from "@liexp/test/lib/arbitrary/GroupMember.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Get event from link", () => {
  let appTest: AppTest;
  const [firstActor, secondActor] = fc.sample(ActorArb, 2);
  const groups = fc.sample(GroupArb, 2).map((g) => ({
    ...g,
    subGroups: [],
    members: [],
  }));
  const groupsMembers = fc.sample(GroupMemberArb, 2).map((gm, i) => ({
    ...gm,
    actor: { id: firstActor.id },
    group: { id: groups[i].id },
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
    socialPosts: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(ActorEntity, [firstActor, secondActor]));
    await throwTE(appTest.ctx.db.save(GroupEntity, groups));
    await throwTE(appTest.ctx.db.save(GroupMemberEntity, groupsMembers));

    const events = [...eventsData];

    await throwTE(appTest.ctx.db.save(EventV2Entity, events));
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
