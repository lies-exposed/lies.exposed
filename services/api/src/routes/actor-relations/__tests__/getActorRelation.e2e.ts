import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import * as tests from "@liexp/test/lib/index.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Get Actor Relation", () => {
  let authorizationToken: string;
  let Test: AppTest;
  const actors = tests.fc.sample(ActorArb, 2).map(toActorEntity);
  const actorRelations = [
    {
      actor: actors[0],
      relatedActor: actors[1],
      type: ActorRelationType.members[0].literals[0],
      startDate: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Parent-child relation")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
  ];

  beforeAll(async () => {
    Test = await GetAppTest();

    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(ActorRelationEntity, actorRelations));
  });

  test("Should return 404 for non-existent id", async () => {
    const fakeId = tests.fc.sample(UUIDArb, 1)[0];
    const response = await Test.req
      .get(`/v1/actor-relations/${fakeId}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(404);
  });

  test("Should return actor relation by id", async () => {
    const relation = actorRelations[0];
    const response = await Test.req
      .get(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: relation.id,
      type: ActorRelationType.members[0].literals[0],
      actor: {
        id: actors[0].id,
      },
      relatedActor: {
        id: actors[1].id,
      },
    });
  });
});
