import { fc } from "@econnessione/core/tests";
import * as http from "@econnessione/shared/io/http";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { UncategorizedArb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { LinkArb } from "@econnessione/shared/tests/arbitrary/Link.arbitrary";
import { MediaArb } from "@econnessione/shared/tests/arbitrary/Media.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

describe("Edit Event", () => {
  let appTest: AppTest;
  let authorizationToken: string;

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
    payload: {
      ...e.payload,
      groups: [],
      actors: [],
      groupsMembers: [],
    },
    media: [],
    links: [],
    keywords: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [actor] as any[])();
    await appTest.ctx.db.save(GroupEntity, [group] as any[])();
    await appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])();
    const result = await appTest.ctx.db.save(EventV2Entity, [event] as any[])();

    delete (result as any).right[0].endDate;
    delete (result as any).right[0].deletedAt;

    event = {
      ...event,
      ...(result as any).right[0],
    };

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(EventV2Entity, [event.id])();
    await appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should edit the event", async () => {
    const eventData = {
      title: "First event",
      startDate: new Date().toISOString(),
    };

    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
    ).toEqual("Right");

    expect(body).toMatchObject({
      payload: {
        title: eventData.title,
      },
    });

    event = body;
  });

  test("Should add media to the event", async () => {
    const media = fc
      .sample(MediaArb, 2)
      .map(({ id, createdAt, updatedAt, ...image }) => image);

    const eventData = {
      title: "Second edit",
      date: new Date().toISOString(),
      media,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
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
        title: eventData.title,
      },
      date: eventData.date,
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("Should edit event links", async () => {
    const links = fc
      .sample(LinkArb, 5)
      .map(({ provider, keywords, ...linkProps }) => ({
        ...linkProps,
        provider: undefined,
      }));

    const eventData = {
      ...event,
      title: "Event with links",
      startDate: new Date().toISOString(),
      links,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      payload: {
        title: eventData.title,
      },
      updatedAt: body.updatedAt,
    });

    expect(body.links).toHaveLength(5);

    event = body;
  });

  test("Should edit event actors", async () => {
    const eventData = {
      ...event,
      actors: [actor.id],
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        actors: eventData.actors,
      },
      updatedAt: body.updatedAt,
    });

    event = body;
  });

  test("Should edit event groups", async () => {
    const eventData = {
      ...event,
      groups: [group.id],
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      payload: {
        ...event.payload,
        groups: eventData.groups,
      },
    });

    event = body;
  });

  test("Should edit event group members", async () => {
    const eventData = {
      ...event,
      groupsMembers: [groupMember.id],
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        groupsMembers: eventData.groupsMembers,
      },
      updatedAt: body.updatedAt,
    });

    event = body;
  });
});
