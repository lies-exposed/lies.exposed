import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { GroupMemberArb } from "@liexp/test/lib/arbitrary/GroupMember.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import * as A from "fp-ts/lib/Array.js";
import jwt from "jsonwebtoken";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("Search Events", () => {
  let appTest: AppTest, authorizationToken: string, totalEvents: number;
  const [firstActor, secondActor] = fc.sample(ActorArb, 2).map((a) => ({
    ...a,
    memberIn: [],
  }));
  const groups = fc.sample(GroupArb, 10).map((g) => ({
    ...g,
    members: [],
    subGroups: [],
  }));

  const [groupMember] = fc.sample(GroupMemberArb, 1).map((gm) => ({
    ...gm,
    actor: firstActor,
    group: groups[0],
  }));

  const eventsData = fc.sample(UncategorizedArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
  }));

  let events: any[];

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(
      appTest.ctx.db.save(
        ActorEntity,
        [firstActor, secondActor].map(toActorEntity),
      ),
    );

    await throwTE(appTest.ctx.db.save(GroupEntity, groups.map(toGroupEntity)));
    await throwTE(
      appTest.ctx.db.save(GroupMemberEntity, [
        {
          ...groupMember,
          group: toGroupEntity(groups[0]),
          actor: toActorEntity(firstActor),
        },
      ]),
    );
    const groupMemberEvents = pipe(
      eventsData,
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          groupsMembers: [groupMember.id],
        },
      })),
    );
    const firstActorEvents = pipe(
      eventsData,
      A.takeRight(90),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors: [firstActor.id],
        },
      })),
    );
    const secondActorEvents = pipe(
      eventsData,
      A.takeRight(80),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors: [secondActor.id],
        },
      })),
    );
    const groupEvents = pipe(
      eventsData,
      A.takeRight(70),
      A.takeLeft(10),
      A.map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          groups: [groups[0].id],
        },
      })),
    );

    events = [
      ...groupMemberEvents,
      ...firstActorEvents,
      ...secondActorEvents,
      ...groupEvents,
    ];

    await throwTE(appTest.ctx.db.save(EventV2Entity, events));

    totalEvents = await throwTE(appTest.ctx.db.count(EventV2Entity));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET,
    )}`;
  });

  describe("Search by actors", () => {
    test("Get events for given actor", async () => {
      const response = await appTest.req
        .get(`/v1/events/search`)
        .query({ "actors[]": firstActor.id })
        .set("Authorization", authorizationToken);

      const { totals } = response.body.data;

      expect(response.status).toEqual(200);
      // events include also events where actor is a group member
      expect(totals.uncategorized).toBeGreaterThanOrEqual(10);

      const {
        avatar: _avatar,
        death: _death,
        diedOn: _diedOn,
        bornOn: _bornOn,
        ...expectedActor
      } = firstActor;
      expect(response.body.data.events[0]).toMatchObject({
        payload: {
          actors: [
            {
              ...expectedActor,
              updatedAt: expectedActor.updatedAt.toISOString(),
              createdAt: expectedActor.createdAt.toISOString(),
              memberIn: [
                // groups[0].id
                expect.any(String),
              ],
              deletedAt: null,
            },
          ],
        },
      });
    });

    test("Get events for given actors", async () => {
      const response = await appTest.req
        .get(`/v1/events/search`)
        .query({ actors: [firstActor.id, secondActor.id] })
        .set("Authorization", authorizationToken);

      const { totals } = response.body.data;

      expect(response.status).toEqual(200);
      expect(totals.uncategorized).toBe(20);
    });
  });

  describe("Search by groups", () => {
    test("Get events for given group", async () => {
      const firstGroup = groups[0];
      const response = await appTest.req
        .get(`/v1/events/search`)
        .query({ "groups[]": firstGroup.id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);

      const { deletedAt: _deletedAt, ...expectedGroup } = firstGroup;
      const {
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        creator: _creator,
        extra: _extra,
        description,
        deletedAt: _groupAvatarDeletedAt,
        ...expectedGroupAvatar
      } = expectedGroup.avatar ?? {};

      expect(response.body.data.events[0]).toMatchObject({
        payload: {
          groups: [
            {
              ...expectedGroup,
              avatar: expectedGroupAvatar
                ? {
                    ...expectedGroupAvatar,
                    ...(description ? { description } : {}),
                    socialPosts: [],
                  }
                : undefined,
              subGroups: [],
              startDate: expectedGroup.startDate?.toISOString(),
              endDate: expectedGroup.endDate?.toISOString(),
              createdAt: firstGroup.createdAt.toISOString(),
              updatedAt: firstGroup.updatedAt.toISOString(),
            },
          ],
        },
      });
    });
  });

  describe.skip("Search by group member", () => {
    test("Should return events for given group member", async () => {
      const response = await appTest.req
        .get(`/v1/events/search`)
        .query({ "groupsMembers[]": groupMember.id })
        .set("Authorization", authorizationToken);

      expect(response.status).toEqual(200);
      expect(response.body.data.totals.uncategorized).toBe(10);
      expect(response.body.data.events[0]).toMatchObject({
        payload: {
          groupsMembers: [groupMember.id],
        },
      });
    });
  });

  test("Should return all the events", async () => {
    const response = await appTest.req
      .get(`/v1/events/search`)
      .set("Authorization", authorizationToken);

    const { totals } = response.body.data;

    expect(response.status).toEqual(200);

    expect(totals.uncategorized).toBeLessThanOrEqual(totalEvents);
  });
});
