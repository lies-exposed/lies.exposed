import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { toActorEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Actor Relation", () => {
  let Test: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;
  let actors: ActorEntity[];
  const actorRelations: ActorRelationEntity[] = [];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    actors = tests.fc.sample(ActorArb, 3).map(toActorEntity);

    await throwTE(Test.ctx.db.save(ActorEntity, actors));
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/actor-relations").send({
      actor: tests.fc.sample(UUIDArb, 1)[0],
      relatedActor: tests.fc.sample(UUIDArb, 1)[0],
      type: ActorRelationType.members[0].literals[0],
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 400 when actor does not exist", async () => {
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: tests.fc.sample(UUIDArb, 1)[0],
        relatedActor: actors[1].id,
        type: ActorRelationType.members[0].literals[0],
      });

    expect(response.status).toEqual(400);
  });

  test("Should return 400 when relatedActor does not exist", async () => {
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[0].id,
        relatedActor: tests.fc.sample(UUIDArb, 1)[0],
        type: ActorRelationType.members[0].literals[0],
      });

    expect(response.status).toEqual(400);
  });

  test("Should create parent-child relation", async () => {
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[0].id,
        relatedActor: actors[1].id,
        type: ActorRelationType.members[0].literals[0],
        startDate: new Date().toISOString(),
        excerpt: toInitialValue("Parent-child relationship"),
      });

    expect(response.status).toEqual(201);
    expect(response.body.data).toMatchObject({
      type: ActorRelationType.members[0].literals[0],
      actor: {
        id: actors[0].id,
      },
      relatedActor: {
        id: actors[1].id,
      },
    });
    actorRelations.push(response.body.data);
  });

  test("Should return 400 when duplicate relation exists", async () => {
    // First, create the relation within this test's transaction
    const firstResponse = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[0].id,
        relatedActor: actors[1].id,
        type: ActorRelationType.members[0].literals[0],
        startDate: new Date().toISOString(),
        excerpt: toInitialValue("Original relation"),
      });

    expect(firstResponse.status).toEqual(201);

    // Then, attempt to create the same relation again
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[0].id,
        relatedActor: actors[1].id,
        type: ActorRelationType.members[0].literals[0],
        startDate: new Date().toISOString(),
        excerpt: toInitialValue("Duplicate relation"),
      });

    expect(response.status).toEqual(400);
  });

  test("Should create spouse relation", async () => {
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[1].id,
        relatedActor: actors[2].id,
        type: ActorRelationType.members[1].literals[0],
        startDate: new Date().toISOString(),
        excerpt: toInitialValue("Married couple"),
      });

    expect(response.status).toEqual(201);
    expect(response.body.data).toMatchObject({
      type: ActorRelationType.members[1].literals[0],
      actor: {
        id: actors[1].id,
      },
      relatedActor: {
        id: actors[2].id,
      },
    });
    actorRelations.push(response.body.data);
  });

  test("Should create relation with minimal data", async () => {
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: actors[2].id,
        relatedActor: actors[0].id,
        type: ActorRelationType.members[0].literals[0],
        startDate: new Date().toISOString(),
        excerpt: toInitialValue("Another parent-child relation"),
      });

    expect(response.status).toEqual(201);
    expect(response.body.data).toMatchObject({
      type: ActorRelationType.members[0].literals[0],
      actor: {
        id: actors[2].id,
      },
      relatedActor: {
        id: actors[0].id,
      },
    });
  });

  test("Should return 400 when PARENT_CHILD relation would form a cycle", async () => {
    const [a, b] = tests.fc.sample(ActorArb, 2).map(toActorEntity);
    await throwTE(Test.ctx.db.save(ActorEntity, [a, b]));

    // Create A → B (A is parent of B)
    const first = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: a.id,
        relatedActor: b.id,
        type: ActorRelationType.members[0].literals[0],
      });
    expect(first.status).toEqual(201);

    // Try to create B → A (B is parent of A) — this would form a cycle
    const response = await Test.req
      .post("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .send({
        actor: b.id,
        relatedActor: a.id,
        type: ActorRelationType.members[0].literals[0],
      });

    expect(response.status).toEqual(400);
  });
});
