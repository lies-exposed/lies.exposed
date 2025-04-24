import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import {
  toActorEntity,
  toGroupEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import * as tests from "@liexp/test/lib/index.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("List Group Member", () => {
  let authorizationToken: string;
  let Test: AppTest;
  const actors = tests.fc.sample(ActorArb, 1).map(toActorEntity);
  const groups = tests.fc.sample(GroupArb, 1).map(toGroupEntity);
  const groupsMembers = groups.map((g) => ({
    actor: actors[0],
    group: g,
    startDate: new Date(),
    updatedAt: new Date(),
    createdAt: new Date(),
    deletedAt: null,
    endDate: null,
    body: [toParagraph("Group member")],
    id: tests.fc.sample(UUIDArb, 1)[0],
  }));

  beforeAll(async () => {
    Test = await GetAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(GroupEntity, groups));
    await throwTE(Test.ctx.db.save(GroupMemberEntity, groupsMembers));
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
          diedOn: actorDiedOn,
          bornOn: actorBornOn,
          death,
          deletedAt: aDeletedAt,
          eventCount,
          events: actorEvents,
          stories: actorStories,
          ...expectedActor
        },
        group: {
          old_avatar: oldGroupAvatar,
          avatar: groupAvatar,
          createdAt: groupCreatedAt,
          updatedAt: groupUpdatedAt,
          stories: groupStories,
          deletedAt,
          startDate,
          endDate: groupEndDate,
          ...expectedGroup
        },
        ...expectedResult
      } = expectedResults[i];

      expect(d).toMatchObject({
        ...expectedResult,
        startDate: expectedResult.startDate.toISOString(),
        actor: {
          ...expectedActor,
          // bornOn: actorBornOn
          //   ? startOfDay(actorBornOn).toISOString()
          //   : undefined,
        },
        group: {
          ...expectedGroup,
        },
      });
    });
  });
});
