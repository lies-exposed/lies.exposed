import * as http from "@liexp/shared/io/http";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { ActorEntity } from "@entities/Actor.entity";
import { AreaArb } from "@liexp/shared/tests/arbitrary/Area.arbitrary";
import { AreaEntity } from "@entities/Area.entity";
import { UncategorizedArb } from "@liexp/shared/tests/arbitrary/Event.arbitrary";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import { GroupEntity } from "@entities/Group.entity";
import { LinkArb } from "@liexp/shared/tests/arbitrary/Link.arbitrary";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { MediaArb } from "@liexp/shared/tests/arbitrary/Media.arbitrary";
import { UserEntity } from "@entities/User.entity";
import { UserArb } from "@liexp/shared/tests/arbitrary/User.arbitrary";
import { hash } from "@utils/password.utils";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import { AppTest, GetAppTest } from "../../../../test/AppTest";

describe("Edit Event", () => {
  let appTest: AppTest;
  let adminAuthToken: string;
  let supporterAuthToken: string;
  const adminUserPassword = "admin1";
  let adminUser: http.User.User;
  const supporterPassword = "supporter1";
  let supporterUser: http.User.User;

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

  beforeAll(async () => {
    appTest = GetAppTest();

    await throwTE(appTest.ctx.db.save(AreaEntity, [{ ...area, media: [] }]));
    await throwTE(appTest.ctx.db.save(ActorEntity, [actor] as any[]));
    await throwTE(appTest.ctx.db.save(GroupEntity, [group] as any[]));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])
    );
    const result = await throwTE(
      appTest.ctx.db.save(EventV2Entity, [event] as any[])
    );

    delete (result[0] as any).deletedAt;
    event = {
      ...event,
      ...(result[0] as any),
    };

    const adminPasswordHash = await throwTE(hash(adminUserPassword));

    adminUser = fc.sample(UserArb).map((u) => ({
      ...u,
      permissions: [http.User.AdminDelete.value],
    }))[0];

    const supporterPasswordHash = await throwTE(hash(supporterPassword));
    supporterUser = fc.sample(UserArb).map((u) => ({
      ...u,
      permissions: [http.User.EventSuggestionEdit.value],
    }))[0];

    await throwTE(
      appTest.ctx.db.save(UserEntity, [
        { ...adminUser, passwordHash: adminPasswordHash },
        { ...supporterUser, passwordHash: supporterPasswordHash },
      ])
    );

    adminAuthToken = await appTest.req
      .post("/v1/users/login")
      .send({ username: adminUser.username, password: adminUserPassword })
      .expect(201)
      .then((response) => {
        return response.body.data.token;
      });

    supporterAuthToken = await appTest.req
      .post("/v1/users/login")
      .send({ username: supporterUser.username, password: supporterPassword })
      .then((response) => {
        return response.body.data.token;
      });
  });

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(EventV2Entity, [event.id]));
    await throwTE(appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id]));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(appTest.ctx.db.delete(GroupEntity, [group.id]));
    await throwTE(appTest.ctx.db.close());
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
      .set("Authorization", `Token ${supporterAuthToken}`)
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
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
    ).toEqual("Right");

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        ...eventData.payload,
      },
      date: eventData.date,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("Should add media to the event", async () => {
    const media = fc
      .sample(MediaArb, 2)
      .map(({ id, createdAt, updatedAt, ...image }) => image);

    const eventData = {
      ...event,
      payload: {
        ...event.payload,
        title: "Second edit",
      },
      date: new Date().toISOString(),
      media,
    };

    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send(eventData)
      .expect(200);

    const body = response.body.data;

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
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
  });

  test("Should edit event links", async () => {
    appTest.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title: "link title",
      description: "link description",
      keywords: [],
    });

    const links = fc
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
      links,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", `Bearer ${adminAuthToken}`)
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
      .set("Authorization", `Bearer ${adminAuthToken}`)
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
      .set("Authorization", `Bearer ${adminAuthToken}`)
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
      .set("Authorization", `Bearer ${adminAuthToken}`)
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
      .set("Authorization", `Bearer ${adminAuthToken}`)
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
