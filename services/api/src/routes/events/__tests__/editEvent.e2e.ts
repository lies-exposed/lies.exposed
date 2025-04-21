import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { Schema } from "effect";
import fc from "fast-check";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Event", () => {
  let appTest: AppTest;
  let adminAuthToken: string;
  let supporterAuthToken: string;
  let adminUser: UserTest;
  let supporterUser: UserTest;

  const [area] = fc.sample(AreaArb, 1);
  const [actor] = fc.sample(ActorArb, 1).map(toActorEntity);
  const [group] = fc.sample(GroupArb, 1).map(toGroupEntity);
  const groupMember = {
    id: fc.sample(UUIDArb, 1)[0],
    actor,
    group,
    startDate: new Date(),
    body: undefined,
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
    socialPosts: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(
      appTest.ctx.db.save(AreaEntity, [{ ...area, featuredImage: null }]),
    );
    await throwTE(appTest.ctx.db.save(ActorEntity, [actor]));
    await throwTE(appTest.ctx.db.save(GroupEntity, [group]));
    await throwTE(appTest.ctx.db.save(GroupMemberEntity, [groupMember]));
    const result = await throwTE(appTest.ctx.db.save(EventV2Entity, [event]));

    const eventExcerpt = toInitialValue("Death of an actor");
    const eventBody = toInitialValue("Death of an actor extended");
    event = {
      ...event,
      ...(result[0] as any),
      excerpt: eventExcerpt,
      body: eventBody,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
    delete event.payload.endDate;
    delete event.payload.location;
    delete event.deletedAt;

    adminUser = await saveUser(appTest.ctx, [
      http.User.AdminDelete.literals[0],
    ]);

    supporterUser = await saveUser(appTest.ctx, []);

    adminAuthToken = await loginUser(appTest)(adminUser).then(
      ({ authorization }) => authorization,
    );

    supporterAuthToken = await loginUser(appTest)(supporterUser).then(
      ({ authorization }) => authorization,
    );
  });

  afterAll(async () => {
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
      Schema.decodeUnknownEither(http.Events.Uncategorized.Uncategorized)(
        response.body.data,
      )._tag,
    ).toEqual("Right");

    expect(body).toMatchObject({
      ...event,
      payload: {
        ...event.payload,
        ...eventData.payload,
      },
      socialPosts: [],
      date: eventData.date,
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
      Schema.decodeUnknownEither(http.Events.Uncategorized.Uncategorized)(
        response.body.data,
      )._tag,
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
      socialPosts: [],
    });

    event = body;
  });
});
