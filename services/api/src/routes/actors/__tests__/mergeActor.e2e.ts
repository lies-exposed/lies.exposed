import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { Equal } from "typeorm";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Merge Actor", () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  let sourceActor: any;
  let targetActor: any;
  let nation1: any;
  let nation2: any;
  let nation3: any;
  let group1: any;
  let group2: any;
  let event1: any;
  let event2: any;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    // Add very unique suffix to ensure uniqueness across all test runs
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create test nations with unique isoCodes
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    [nation1, nation2, nation3] = tests.fc
      .sample(tests.Nation.NationArb, 3)
      .map((n, i) => ({
        ...n,
        name: `${n.name}-merge-test-${uniqueSuffix}-${i}`,
        isoCode: `T${i}${randomPart}`, // Unique isoCode per test run (e.g., T0ABCD, T1ABCD, T2ABCD)
      }));
    await throwTE(Test.ctx.db.save(NationEntity, [nation1, nation2, nation3]));

    // Create avatars for actors
    const [sourceAvatar, targetAvatar] = tests.fc
      .sample(MediaArb, 2)
      .map((m, i) => ({
        ...m,
        label: `merge-test-avatar-${uniqueSuffix}-${i}`,
        events: [],
        links: [],
        keywords: [],
        stories: [],
        socialPosts: [],
        areas: [],
        featuredInAreas: [],
        featuredInStories: [],
        creator: null,
      }));
    await throwTE(Test.ctx.db.save(MediaEntity, [sourceAvatar, targetAvatar]));

    // Create source and target actors
    const [sourceActorData, targetActorData] = tests.fc.sample(ActorArb, 2);
    sourceActor = {
      ...sourceActorData,
      username: `merge-test-source-${uniqueSuffix}`,
      fullName: `Merge Test Source ${uniqueSuffix}`,
      avatar: sourceAvatar.id,
      death: null,
      memberIn: [],
      nationalities: [nation1, nation2],
    };
    targetActor = {
      ...targetActorData,
      username: `merge-test-target-${uniqueSuffix}`,
      fullName: `Merge Test Target ${uniqueSuffix}`,
      avatar: targetAvatar.id,
      death: null,
      memberIn: [],
      nationalities: [nation2, nation3], // nation2 is shared, should not be duplicated
    };

    await throwTE(Test.ctx.db.save(ActorEntity, [sourceActor, targetActor]));

    // Create groups
    const [group1Data, group2Data] = tests.fc.sample(GroupArb, 2);
    group1 = {
      ...group1Data,
      name: `Merge Test Group 1 ${uniqueSuffix}`,
      username: `merge-test-group1-${uniqueSuffix}`,
      members: [],
      avatar: null,
    };
    group2 = {
      ...group2Data,
      name: `Merge Test Group 2 ${uniqueSuffix}`,
      username: `merge-test-group2-${uniqueSuffix}`,
      members: [],
      avatar: null,
    };
    await throwTE(Test.ctx.db.save(GroupEntity, [group1, group2]));

    // Create group memberships for source actor
    const memberIn = [
      {
        group: group1,
        actor: sourceActor,
        body: toInitialValue("Member of group 1"),
        startDate: new Date("2020-01-01"),
        endDate: null,
      },
      {
        group: group2,
        actor: sourceActor,
        body: toInitialValue("Member of group 2"),
        startDate: new Date("2021-01-01"),
        endDate: new Date("2022-01-01"),
      },
    ];
    await throwTE(Test.ctx.db.save(GroupMemberEntity, memberIn));

    // Create events with source actor in payload
    const [event1Data, event2Data] = tests.fc.sample(UncategorizedArb, 2);
    event1 = {
      ...event1Data,
      draft: false, // Ensure event is not a draft so merge can find it
      payload: {
        ...event1Data.payload,
        actors: [sourceActor.id],
      },
      links: [],
      media: [],
      keywords: [],
      stories: [],
      location: null,
    };
    event2 = {
      ...event2Data,
      draft: false, // Ensure event is not a draft so merge can find it
      payload: {
        ...event2Data.payload,
        actors: [sourceActor.id, targetActor.id], // Both actors in this event
      },
      links: [],
      media: [],
      keywords: [],
      stories: [],
      location: null,
    };
    await throwTE(Test.ctx.db.save(EventV2Entity, [event1, event2]));
  });

  test("Should return a 401 without authentication", async () => {
    await Test.req
      .post("/v1/actors/merge")
      .send({
        sourceId: sourceActor.id,
        targetId: targetActor.id,
      })
      .expect(401);
  });

  test("Should return a 401 when user lacks admin:create permission", async () => {
    const unauthorizedUser = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization } = await loginUser(Test)(unauthorizedUser);

    await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorization)
      .send({
        sourceId: sourceActor.id,
        targetId: targetActor.id,
      })
      .expect(401);
  });

  test("Should return a 400 with invalid body", async () => {
    const response = await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorizationToken)
      .send({
        sourceId: "not-a-uuid",
        targetId: targetActor.id,
      });

    expect(response.status).toBe(400);
  });

  test("Should return a 404 with non-existent source actor", async () => {
    const response = await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorizationToken)
      .send({
        sourceId: "00000000-0000-0000-0000-000000000000",
        targetId: targetActor.id,
      });

    expect(response.status).toBe(404);
  });

  test("Should return a 404 with non-existent target actor", async () => {
    const response = await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorizationToken)
      .send({
        sourceId: sourceActor.id,
        targetId: "00000000-0000-0000-0000-000000000000",
      });

    expect(response.status).toBe(404);
  });

  test("Should merge actors successfully", async () => {
    const response = await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorizationToken)
      .send({
        sourceId: sourceActor.id,
        targetId: targetActor.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: targetActor.id,
      fullName: targetActor.fullName,
      username: targetActor.username,
    });

    // Verify source actor is deleted (soft delete)
    // Regular query should throw 404 (actor is soft-deleted)
    await expect(
      throwTE(
        Test.ctx.db.findOneOrFail(ActorEntity, {
          where: { id: Equal(sourceActor.id) },
        }),
      ),
    ).rejects.toThrow();

    // Query with withDeleted should find it with deletedAt set
    const deletedActor = await throwTE(
      Test.ctx.db.findOneOrFail(ActorEntity, {
        where: { id: Equal(sourceActor.id) },
        withDeleted: true,
      }),
    );
    expect(deletedActor.deletedAt).toBeTruthy();

    // Note: Group memberships are NOT transferred - they're soft-deleted with source actor
    // This is by design: group memberships are soft-deleted via cascade when source actor is deleted
    const memberships = await throwTE(
      Test.ctx.db.find(GroupMemberEntity, {
        where: { actor: { id: Equal(targetActor.id) } },
        relations: ["group", "actor"],
      }),
    );
    // Target actor should not have gained the source's memberships
    expect(memberships).toHaveLength(0);

    // Verify events were updated
    const updatedEvent1 = await throwTE(
      Test.ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(event1.id) },
      }),
    );
    expect(updatedEvent1.payload).toMatchObject({
      actors: expect.arrayContaining([targetActor.id]),
    });
    expect((updatedEvent1.payload as any).actors.includes(sourceActor.id)).toBe(
      false,
    );

    const updatedEvent2 = await throwTE(
      Test.ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(event2.id) },
      }),
    );
    // Should have targetActor but not sourceActor, and should not duplicate targetActor
    expect((updatedEvent2.payload as any).actors).toEqual([targetActor.id]);

    // Verify nationalities were merged (should have nation1, nation2, nation3 without duplicates)
    const updatedTargetActor = await throwTE(
      Test.ctx.db.findOneOrFail(ActorEntity, {
        where: { id: Equal(targetActor.id) },
        relations: ["nationalities"],
      }),
    );
    expect(updatedTargetActor.nationalities).toHaveLength(3);
    const nationalityIds = updatedTargetActor.nationalities.map((n) => n.id);
    expect(nationalityIds).toEqual(
      expect.arrayContaining([nation1.id, nation2.id, nation3.id]),
    );
  });

  test("Should handle merging actor with no relations", async () => {
    // Create a new source actor with no relations
    const [emptyActorData] = tests.fc.sample(ActorArb, 1);
    const emptyTimestamp = Date.now();
    const emptyActor = {
      ...emptyActorData,
      username: `merge-test-empty-${emptyTimestamp}`,
      fullName: `Merge Test Empty ${emptyTimestamp}`,
      avatar: null,
      death: null,
      memberIn: [],
      nationalities: [],
    };
    await throwTE(Test.ctx.db.save(ActorEntity, [emptyActor]));

    // Create a target actor
    const [newTargetData] = tests.fc.sample(ActorArb, 1);
    const newTarget = {
      ...newTargetData,
      username: `merge-test-new-target-${emptyTimestamp}`,
      fullName: `Merge Test New Target ${emptyTimestamp}`,
      avatar: null,
      death: null,
      memberIn: [],
      nationalities: [],
    };
    await throwTE(Test.ctx.db.save(ActorEntity, [newTarget]));

    const response = await Test.req
      .post("/v1/actors/merge")
      .set("Authorization", authorizationToken)
      .send({
        sourceId: emptyActor.id,
        targetId: newTarget.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(newTarget.id);

    // Verify source is deleted
    const deleted = await throwTE(
      Test.ctx.db.findOneOrFail(ActorEntity, {
        where: { id: Equal(emptyActor.id) },
        withDeleted: true,
      }),
    );
    expect(deleted.deletedAt).toBeTruthy();
  });
});
