import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { UUIDArb } from "@liexp/shared/lib/tests/arbitrary/common/UUID.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";

describe("List Group Member", () => {
  let authorizationToken: string;
  let Test: AppTest;
  const actors = tests.fc.sample(ActorArb, 1).map((a) => ({
    ...a,
    death: undefined,
    memberIn: [],
  }));
  const groups = tests.fc.sample(GroupArb, 1).map((g) => ({
    ...g,
    // avatar: undefined,
    members: [],
  }));
  const groupsMembers = groups.map((g) => ({
    actor: actors[0],
    group: g,
    startDate: new Date(),
    body: { content: "Group member" },
    id: tests.fc.sample(UUIDArb, 1)[0],
  }));

  beforeAll(async () => {
    Test = await GetAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
    await throwTE(Test.ctx.db.save(ActorEntity, actors as any[]));
    await throwTE(Test.ctx.db.save(GroupEntity, groups as any[]));
    await throwTE(Test.ctx.db.save(GroupMemberEntity, groupsMembers as any[]));
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should return group member by given actor", async () => {
    const actor = actors[0].id;
    const response = await Test.req
      .get("/v1/groups-members")
      .set("Authorization", authorizationToken)
      .query({ actor });

    const expectedResults = groupsMembers.filter((g) => g.actor.id === actor);

    expect(response.status).toEqual(200);

    response.body.data.forEach((d: any, i: number): void => {
      const {
        createdAt,
        updatedAt: groupMemberUDate,
        endDate,
        deletedAt: gmDeletedAt,
        actor: {
          old_avatar: oldActorAvatar,
          avatar: actorAvatar,
          createdAt: actorCreatedAt,
          updatedAt: actorUAT,
          bornOn: actorBornOn,
          diedOn: actorDiedOn,
          death,
          deletedAt: aDeletedAt,
          ...expectedActor
        },
        group: {
          old_avatar: oldGroupAvatar,
          avatar: groupAvatar,
          createdAt: groupCreatedAt,
          updatedAt: groupUpdatedAt,
          subGroups,
          deletedAt,
          ...expectedGroup
        },
        ...expectedResult
      } = expectedResults[i] as any;

      expect(d).toMatchObject({
        ...expectedResult,
        startDate: expectedResult.startDate.toISOString(),
        actor: {
          ...expectedActor,
          // diedOn: actorDiedOn ?? undefined,
          bornOn: new Date(actorBornOn).toISOString() ?? undefined,
        },
        group: {
          ...expectedGroup,
          startDate: expectedGroup.startDate?.toISOString(),
          endDate: expectedGroup.startDate?.toISOString(),
        },
      });
    });
  });
});
