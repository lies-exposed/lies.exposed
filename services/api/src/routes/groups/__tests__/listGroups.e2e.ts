import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { FastCheck } from "effect";
import * as A from "fp-ts/lib/Array.js";
import jwt from "jsonwebtoken";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Groups", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  let totalEvents: number;
  const actors = FastCheck.sample(ActorArb, 10).map((a) => ({
    ...a,
    avatar: a.avatar
      ? ({
          ...a.avatar,
          stories: [],
          featuredInAreas: [],
        } as any as MediaEntity)
      : null,
    memberIn: [],
    groups: [],
    stories: [],
    events: [],
    nationalities: [],
    eventCount: 0,
    bornOn: a.bornOn ?? null,
    diedOn: a.diedOn ?? null,
    death: null,
    deletedAt: null,
  }));
  const groups = FastCheck.sample(GroupArb, 100).map((g) => ({
    ...g,
    username: g.username ?? null,
    avatar: g.avatar
      ? ({
          ...g.avatar,
          stories: [],
          featuredInAreas: [],
        } as any as MediaEntity)
      : null,
    startDate: g.startDate ?? null,
    endDate: g.endDate ?? null,
    members: [],
    stories: [],
    deletedAt: null,
  }));
  let groupMembers: Partial<GroupMemberEntity>[];

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(ActorEntity, actors));

    await throwTE(appTest.ctx.db.save(GroupEntity, groups));

    groupMembers = pipe(
      groups,
      A.takeLeft(5),
      A.map((g) => ({
        actor: actors[0],
        group: g,
        startDate: new Date(),
        body: toInitialValue(`${g.name} => ${actors[0].fullName}`),
      })),
    );

    await throwTE(appTest.ctx.db.save(GroupMemberEntity, groupMembers));
    totalEvents = await throwTE(appTest.ctx.db.count(GroupEntity));

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET,
    )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        GroupMemberEntity,
        groupMembers.flatMap((g) => (g.id ? [g.id] : [])),
      ),
    );
    await throwTE(
      appTest.ctx.db.delete(
        ActorEntity,
        actors.map((a) => a.id),
      ),
    );
    await throwTE(
      appTest.ctx.db.delete(
        GroupEntity,
        groups.map((g) => g.id),
      ),
    );
  });

  test("Should return all groups", async () => {
    const response = await appTest.req
      .get(`/v1/groups`)
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);

    expect(total).toBe(totalEvents);
  });

  test("Should return groups by given member", async () => {
    const response = await appTest.req
      .get(`/v1/groups`)
      .query({ "members[]": actors[0].id })
      .set("Authorization", authorizationToken);

    const { total } = response.body;

    expect(response.status).toEqual(200);
    expect(total).toBe(5);

    expect(response.body.data[0].members).toHaveLength(1);
  });
});
