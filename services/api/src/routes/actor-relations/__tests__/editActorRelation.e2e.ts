import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import {
  toParagraph,
  toInitialValue,
} from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Edit Actor Relation", () => {
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
      excerpt: [toParagraph("Original relation")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
  ];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:edit"]);
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
    const response = await Test.req
      .put(`/v1/actor-relations/${relation.id}`)
      .send({
        type: ActorRelationType.members[1].literals[0],
      });

    expect(response.status).toEqual(401);
  });

  test("Should return 404 for non-existent id", async () => {
    const fakeId = tests.fc.sample(UUIDArb, 1)[0];
    const response = await Test.req
      .put(`/v1/actor-relations/${fakeId}`)
      .set("Authorization", authorizationToken)
      .send({
        type: ActorRelationType.members[1].literals[0],
      });

    expect(response.status).toEqual(404);
  });

  test("Should update actor relation type", async () => {
    const relation = actorRelations[0];
    const response = await Test.req
      .put(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken)
      .send({
        type: ActorRelationType.members[1].literals[0],
      });

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: relation.id,
      type: ActorRelationType.members[1].literals[0],
    });
  });

  test("Should update actor relation dates", async () => {
    const relation = actorRelations[0];
    const endDate = new Date();
    const response = await Test.req
      .put(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken)
      .send({
        endDate: endDate.toISOString(),
      });

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: relation.id,
      endDate: endDate.toISOString(),
    });
  });

  test("Should update actor relation excerpt", async () => {
    const relation = actorRelations[0];
    const newExcerpt = toInitialValue("Updated relationship description");
    const response = await Test.req
      .put(`/v1/actor-relations/${relation.id}`)
      .set("Authorization", authorizationToken)
      .send({
        excerpt: newExcerpt,
      });

    expect(response.status).toEqual(200);
    expect(response.body.data.excerpt).toBeTruthy();
  });

  test("Should return 400 when edit would create a PARENT_CHILD cycle", async () => {
    const [a, b, c] = tests.fc.sample(ActorArb, 3).map(toActorEntity);
    await throwTE(Test.ctx.db.save(ActorEntity, [a, b, c]));

    // Existing: A → B (A is parent of B)
    const existingId = tests.fc.sample(UUIDArb, 1)[0];
    await throwTE(
      Test.ctx.db.save(ActorRelationEntity, [
        {
          id: existingId,
          actor: a,
          relatedActor: b,
          type: ActorRelationType.members[0].literals[0],
          startDate: new Date(),
          endDate: null,
          excerpt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]),
    );

    // A separate relation C → A that we will edit into B → A
    const editableId = tests.fc.sample(UUIDArb, 1)[0];
    await throwTE(
      Test.ctx.db.save(ActorRelationEntity, [
        {
          id: editableId,
          actor: c,
          relatedActor: a,
          type: ActorRelationType.members[0].literals[0],
          startDate: new Date(),
          endDate: null,
          excerpt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]),
    );

    // Edit C → A to become B → A (would create cycle: A→B and B→A)
    const response = await Test.req
      .put(`/v1/actor-relations/${editableId}`)
      .set("Authorization", authorizationToken)
      .send({ actor: b.id, relatedActor: a.id });

    expect(response.status).toEqual(400);
  });
});
