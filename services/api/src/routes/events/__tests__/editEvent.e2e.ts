import { fc } from "@econnessione/core/tests";
import * as http from "@econnessione/shared/io/http";
import { EventArb, MediaArb } from "@econnessione/shared/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventEntity } from "../../../entities/Event.entity";
import { GroupMemberEntity } from "../../../entities/GroupMember.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

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
  let [event] = fc.sample(EventArb, 1).map(({ endDate, ...e }) => ({
    ...e,
    media: [],
    links: [],
    groups: [],
    actors: [],
    groupsMembers: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(ActorEntity, [actor] as any[])();
    await appTest.ctx.db.save(GroupEntity, [group] as any[])();
    await appTest.ctx.db.save(GroupMemberEntity, [groupMember] as any[])();
    const result = await appTest.ctx.db.save(EventEntity, [event] as any[])();

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
    await appTest.ctx.db.delete(EventEntity, [event.id])();
    await appTest.ctx.db.delete(GroupMemberEntity, [groupMember.id])();
    await appTest.ctx.db.delete(ActorEntity, [actor.id])();
    await appTest.ctx.db.delete(GroupEntity, [group.id])();
    await appTest.ctx.db.close()();
  });

  test("Should edit the event", async () => {
    const eventData = {
      ...event,
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

    event = {
      ...event,
      ...eventData,
    } as any;

    expect(body).toMatchObject({
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });

  test("Should add media to the event", async () => {
    const media = fc
      .sample(MediaArb, 2)
      .map(({ id, createdAt, updatedAt, ...image }) => image);

    const eventData = {
      ...event,
      title: "First event",
      startDate: new Date().toISOString(),
      media,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    // expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
    ).toEqual("Right");

    event = {
      ...event,
      ...eventData,
    } as any;

    delete (eventData as any).media;

    expect(body).toMatchObject({
      ...eventData,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });

  test("Should edit event links", async () => {
    const eventData = {
      ...event,
      title: "Event with links",
      startDate: new Date().toISOString(),
      media: [],
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    event = {
      ...event,
      ...eventData,
    } as any;
    expect(body).toMatchObject({
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
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

    event = {
      ...event,
      ...eventData,
    } as any;
    expect(body).toMatchObject({
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
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

    event = {
      ...event,
      ...eventData,
    } as any;
    expect(body).toMatchObject({
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
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

    event = {
      ...event,
      ...eventData,
    } as any;
    expect(body).toMatchObject({
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });
});
