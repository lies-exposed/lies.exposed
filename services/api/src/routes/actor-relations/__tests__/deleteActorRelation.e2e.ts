import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Delete Actor Relation", () => {
  let Test: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;
  let actors: ActorEntity[];
  const actorRelations = [
    {
      actor: null as any,
      relatedActor: null as any,
      type: ActorRelationType.members[0].literals[0],
      startDate: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Relation to delete")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
  ];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:delete"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    actors = tests.fc.sample(ActorArb, 2).map(toActorEntity);

    await throwTE(Test.ctx.db.save(ActorEntity, actors));

    actorRelations[0].actor = actors[0];
    actorRelations[0].relatedActor = actors[1];
    await throwTE(Test.ctx.db.save(ActorRelationEntity, actorRelations));
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const relation = actorRelations[0];
    const response = await Test.req.delete(
      `/v1/actor-relations/${relation.id}`,
    );

    expect(response.status).toEqual(401);
  });

  test("Should return 404 for non-existent id", async () => {
    const fakeId = tests.fc.sample(UUIDArb, 1)[0];
    const response = await Test.req
      .delete(`/v1/actor-relations/${fakeId}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(404);
  });

  test("Should soft delete actor relation", async () => {
    const relation = actorRelations[0];
    const response = await Test.req
      .delete(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    // Verify it's soft deleted - should not appear in regular queries
    const getResponse = await Test.req
      .get(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken);

    expect(getResponse.status).toEqual(404);
  });
});
