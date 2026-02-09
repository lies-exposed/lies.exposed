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
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("List Actor Relations", () => {
  let Test: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;
  const actors = tests.fc.sample(ActorArb, 3).map(toActorEntity);
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
    {
      actor: actors[1],
      relatedActor: actors[2],
      type: ActorRelationType.members[1].literals[0],
      startDate: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Spouse relation")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
  ];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:read"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    await throwTE(Test.ctx.db.save(ActorEntity, actors));
    await throwTE(Test.ctx.db.save(ActorRelationEntity, actorRelations));
  });

  test("Should return actor relations filtered by actor", async () => {
    const response = await Test.req
      .get("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .query({ actor: actors[1].id });

    expect(response.status).toEqual(200);
    // actors[1] participates in both relations (as relatedActor in [0] and actor in [1])
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    expect(response.body.total).toBeGreaterThanOrEqual(2);

    // Verify our specific relations are present
    const foundIds = response.body.data.map((r: any) => r.id);
    expect(foundIds).toContain(actorRelations[0].id);
    expect(foundIds).toContain(actorRelations[1].id);
  });

  test("Should filter actor relations by type", async () => {
    const response = await Test.req
      .get("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .query({ type: ActorRelationType.members[0].literals[0] });

    expect(response.status).toEqual(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    // All returned relations should be parent_child type
    response.body.data.forEach((relation: any) => {
      expect(relation.type).toEqual(ActorRelationType.members[0].literals[0]);
    });
  });

  test("Should filter actor relations by spouse type", async () => {
    const response = await Test.req
      .get("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .query({ type: ActorRelationType.members[1].literals[0] });

    expect(response.status).toEqual(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    // All returned relations should be spouse type
    response.body.data.forEach((relation: any) => {
      expect(relation.type).toEqual(ActorRelationType.members[1].literals[0]);
    });
  });

  test("Should paginate actor relations", async () => {
    const response = await Test.req
      .get("/v1/actor-relations")
      .set("Authorization", authorizationToken)
      .query({ _start: 0, _end: 1 });

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBeGreaterThanOrEqual(2);
  });
});
