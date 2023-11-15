import * as http from "@liexp/shared/lib/io/http";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary";
import { AreaArb } from "@liexp/shared/lib/tests/arbitrary/Area.arbitrary";
import { UncategorizedArb } from "@liexp/shared/lib/tests/arbitrary/Event.arbitrary";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary";
import { LinkArb } from "@liexp/shared/lib/tests/arbitrary/Link.arbitrary";
import { MediaArb } from "@liexp/shared/lib/tests/arbitrary/Media.arbitrary";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../test/AppTest";
import {
  loginUser,
  saveUser,
  type UserTest,
} from "../../../../test/user.utils";
import { ActorEntity } from "@entities/Actor.entity";
import { AreaEntity } from "@entities/Area.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";

describe("Edit Event", () => {
  let appTest: AppTest;
  let adminAuthToken: string;
  let supporterAuthToken: string;
  let adminUser: UserTest;
  let supporterUser: UserTest;

  const [area] = fc.sample(AreaArb, 1);
  const [actor] = fc.sample(ActorArb, 1).map((a) => ({
    ...a,
    memberIn: [],
  }));
  const [group] = fc.sample(GroupArb, 1);
  const groupMember = {
    id: fc.sample(fc.uuid(), 1)[0],
    actor,
    group,
    startDate: new Date(),
    body: "a group member",
  };

  let [event] = fc.sample(UncategorizedArb, 1).map((e) => ({
    ...e,
    draft: true,
    payload: {
      ...e.payload,
      location: undefined,
      groups: [],
      actors: [],
      groupsMembers: [],
    },
    media: [],
    links: [],
    keywords: [],
  }));
  let links: any[];
  let media: any[];

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(AreaEntity, [{ ...area, media: [] }]));
    await throwTE(appTest.ctx.db.save(ActorEntity, [actor] as any[]));
    await throwTE(appTest.ctx.db.save(GroupEntity, [group] as any[]));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[]),
    );
    const result = await throwTE(
      appTest.ctx.db.save(EventV2Entity, [event] as any[]),
    );

    delete (result[0] as any).deletedAt;
    event = {
      ...event,
      ...(result[0] as any),
    };

    adminUser = await saveUser(appTest, [http.User.AdminDelete.value]);

    supporterUser = await saveUser(appTest, []);

    adminAuthToken = await loginUser(appTest)(adminUser).then(
      ({ authorization }) => authorization,
    );

    supporterAuthToken = await loginUser(appTest)(supporterUser).then(
      ({ authorization }) => authorization,
    );
  });

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(EventV2Entity, [event.id]));
    await throwTE(appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id]));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(appTest.ctx.db.delete(GroupEntity, [group.id]));
    await throwTE(appTest.ctx.db.delete(LinkEntity, links));
    await throwTE(appTest.ctx.db.delete(MediaEntity, media));
    await appTest.utils.e2eAfterAll();
  });

  test("Should receive an error when supporter tries to edit an event", async () => {
    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        title: "First event",
        endDate: new Date().toISOString(),
        location: area.id,
      },
      date: new Date().toISOString(),
    };

    await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", supporterAuthToken)
      .send(eventData)
      .expect(401);
  });

  test("Should edit the event", async () => {
    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        title: "First event",
        endDate: new Date().toISOString(),
        location: area.id,
      },
      date: new Date().toISOString(),
    };

    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag,
    ).toEqual("Right");

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        ...eventData.payload,
      },
      socialPosts: [],
      date: eventData.date,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("Should add media to the event", async () => {
    const mediaData = fc
      .sample(MediaArb, 2)
      .map(({ id, createdAt, updatedAt, ...image }) => image);

    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        title: "Second edit",
      },
      date: new Date().toISOString(),
      media: mediaData,
    };

    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData)
      .expect(200);

    const body = response.body.data;

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag,
    ).toEqual("Right");

    // expect media with length 2
    expect(body.media).toHaveLength(2);

    expect(body).toMatchObject({
      payload: {
        ...event.payload,
        title: eventData.payload.title,
      },
      date: eventData.date,
      updatedAt: body.updatedAt,
    });

    event = body;
    media = body.media;
  });

  test("Should edit event links", async () => {
    appTest.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title: "link title",
      description: "link description",
      keywords: [],
    });

    const linksData = fc
      .sample(LinkArb, 5)
      .map(({ provider, keywords, ...linkProps }) => ({
        ...linkProps,
        provider: undefined,
      }));

    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        title: "Event with links",
      },
      date: new Date().toISOString(),
      links: linksData,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      payload: {
        title: eventData.payload.title,
      },
      date: eventData.date,
      updatedAt: body.updatedAt,
    });

    expect(body.links).toHaveLength(5);

    event = body;
    links = body.links;
  });

  test("Should edit event actors", async () => {
    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        actors: [actor.id],
      },
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        actors: eventData.payload.actors,
      },
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("Should edit event groups", async () => {
    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        groups: [group.id],
      },
    };

    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData)
      .expect(200);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      payload: {
        ...event.payload,
        groups: eventData.payload.groups,
      },
    });

    event = body;
  });

  test("Should edit event group members", async () => {
    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        groupsMembers: [groupMember.id],
      },
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        groupsMembers: eventData.payload.groupsMembers,
      },
      date: event.date,
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("succeeds when changing `draft` value", async () => {
    const eventData = {
      ...event,
      draft: false,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", adminAuthToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...event,
      draft: false,
      payload: {
        ...event.payload,
        groupsMembers: eventData.payload.groupsMembers,
      },
      date: event.date,
      updatedAt: body.updatedAt,
    });

    event = body;
  });
});
