import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { GroupMemberArb } from "@liexp/test/lib/arbitrary/GroupMember.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { CreateEventBodyArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { Schema } from "effect";
import fc from "fast-check";
import * as A from "fp-ts/lib/Array.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Event", () => {
  let appTest: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;

  const keywords = fc.sample(KeywordArb, 5);
  const actors = fc.sample(ActorArb, 3).map((a) => ({
    ...a,
    memberIn: [],
    nationalities: [],
    death: undefined,
  }));
  const groups = fc.sample(GroupArb, 2).map((g) => ({
    ...g,
    avatar: undefined,
    members: [],
  }));
  const media = fc.sample(MediaArb, 2).map((m) => ({
    ...m,
    events: [],
    links: [],
    keywords: [],
    areas: [],
    featuredInStories: [],
    socialPosts: [],
    creator: undefined,
    extra: undefined,
  }));

  let groupMembers: any[] = [];

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
    await throwTE(appTest.ctx.db.save(ActorEntity, actors));
    await throwTE(appTest.ctx.db.save(KeywordEntity, keywords));
    await throwTE(appTest.ctx.db.save(GroupEntity, groups));
    await throwTE(appTest.ctx.db.save(MediaEntity, media));

    // Create group members after groups and actors exist
    groupMembers = fc.sample(GroupMemberArb, 2).map((gm, i) => ({
      ...gm,
      actor: actors[i],
      group: groups[i % groups.length],
    }));
    await throwTE(appTest.ctx.db.save(GroupMemberEntity, groupMembers));
  });

  test("Should create an event", async () => {
    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      keywords: pipe(
        keywords,
        A.takeLeft(3),
        A.map((k) => k.id),
      ),
      media: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      links: [],
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = Schema.decodeUnknownEither(
      http.Events.Uncategorized.Uncategorized,
    )(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
  });

  test("Should create an event with actors", async () => {
    const actorIds = actors.map((a) => a.id);

    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      media: [],
      keywords: [],
      groups: [],
      groupsMembers: [],
      links: [],
      actors: actorIds,
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = Schema.decodeUnknownEither(
      http.Events.Uncategorized.Uncategorized,
    )(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
  });

  test("Should create an event with media", async () => {
    const mediaIds = media.map((m) => m.id);

    const eventData = {
      ...fc.sample(CreateEventBodyArb({}), 1)[0],
      keywords: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      links: [],
      media: mediaIds,
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(201);
    expect(body.media).toHaveLength(mediaIds.length);
  });

  test("Should create an event with groups", async () => {
    const groupIds = groups.map((g) => g.id);

    const createEventBody = fc.sample(CreateEventBodyArb({}), 1)[0];
    const eventData = {
      ...createEventBody,
      keywords: [],
      actors: [],
      media: [],
      groupsMembers: [],
      links: [],
      groups: [],
      payload: {
        ...createEventBody.payload,
        groups: groupIds,
      },
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(201);

    expect(body.payload.groups).toHaveLength(groupIds.length);
  });

  test("Should create an event with group members", async () => {
    const groupMemberIds = groupMembers.map((gm) => gm.id);

    const createEventBody = fc.sample(CreateEventBodyArb({}), 1)[0];
    const eventData = {
      ...createEventBody,
      keywords: [],
      actors: [],
      groups: [],
      media: [],
      links: [],
      payload: {
        ...createEventBody.payload,
        groupsMembers: groupMemberIds,
      },
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(201);
    expect(body.payload.groupsMembers).toHaveLength(groupMemberIds.length);
  });

  test(`Should create a ${EVENT_TYPES.QUOTE} event `, async () => {
    const eventData = {
      date: new Date().toISOString(),
      draft: false,
      type: EVENT_TYPES.QUOTE,
      payload: {
        quote: fc.sample(fc.string(), 1)[0],
        actor: actors[0].id,
      },
      media: [],
      keywords: [],
      links: [],
    };
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = Schema.decodeUnknownEither(http.Events.Quote.Quote)(
      body,
    );

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
  });
});
