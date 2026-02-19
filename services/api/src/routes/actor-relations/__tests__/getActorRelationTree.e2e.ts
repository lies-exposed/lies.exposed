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

describe("Get Actor Relation Tree", () => {
  let Test: AppTest;
  const users: UserTest[] = [];
  let authorizationToken: string;
  const actors = tests.fc.sample(ActorArb, 5).map(toActorEntity);

  // Family structure:
  // actors[0] (grandparent) -> actors[1] (parent) -> actors[3] (child)
  // actors[1] spouse actors[2]
  // actors[1] sibling (shares parent actors[0]) with actors[4]
  const actorRelations = [
    {
      actor: actors[0],
      relatedActor: actors[1],
      type: ActorRelationType.members[0].literals[0],
      startDate: new Date("1980-01-01"),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Grandparent -> Parent")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
    {
      actor: actors[1],
      relatedActor: actors[3],
      type: ActorRelationType.members[0].literals[0],
      startDate: new Date("2000-01-01"),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Parent -> Child")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
    {
      actor: actors[1],
      relatedActor: actors[2],
      type: ActorRelationType.members[1].literals[0],
      startDate: new Date("1995-01-01"),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Married couple")],
      id: tests.fc.sample(UUIDArb, 1)[0],
    },
    {
      actor: actors[0],
      relatedActor: actors[4],
      type: ActorRelationType.members[0].literals[0],
      startDate: new Date("1982-01-01"),
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      endDate: null,
      excerpt: [toParagraph("Grandparent -> Sibling")],
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

  test("Should return 404 for non-existent actor", async () => {
    const fakeId = tests.fc.sample(UUIDArb, 1)[0];
    const response = await Test.req
      .get(`/v1/actor-relations/tree/${fakeId}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(404);
  });

  test("Should return family tree for actor with children", async () => {
    const rootActor = actors[1]; // Parent with child and spouse
    const response = await Test.req
      .get(`/v1/actor-relations/tree/${rootActor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toBeDefined();

    const tree = response.body.data;

    // Check root node
    expect(tree[rootActor.id]).toBeDefined();
    expect(tree[rootActor.id].id).toEqual(rootActor.id);
    expect(tree[rootActor.id].name).toEqual(rootActor.username);
    expect(tree[rootActor.id].fullName).toEqual(rootActor.fullName);

    // Check children
    expect(tree[rootActor.id].children).toContain(actors[3].id);

    // Check parents — actors[0] is the grandparent (parent of actors[1])
    expect(tree[rootActor.id].parents).toContain(actors[0].id);

    // Check spouses
    expect(tree[rootActor.id].spouses).toContain(actors[2].id);

    // Check siblings (should find actor[4] who shares parent actor[0])
    expect(tree[rootActor.id].siblings).toContain(actors[4].id);

    // Check that related actors are in tree
    expect(tree[actors[3].id]).toBeDefined();
    expect(tree[actors[2].id]).toBeDefined();
    expect(tree[actors[4].id]).toBeDefined();
  });

  test("Should return tree with default depth", async () => {
    const rootActor = actors[0]; // Grandparent
    const response = await Test.req
      .get(`/v1/actor-relations/tree/${rootActor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    const tree = response.body.data;

    // Should have root and immediate children
    expect(tree[rootActor.id]).toBeDefined();
    expect(tree[actors[1].id]).toBeDefined();
    expect(tree[actors[4].id]).toBeDefined();
  });

  test("Should handle actor with no relations", async () => {
    const lonelyActor = tests.fc.sample(ActorArb, 1).map(toActorEntity)[0];
    await throwTE(Test.ctx.db.save(ActorEntity, [lonelyActor]));

    const response = await Test.req
      .get(`/v1/actor-relations/tree/${lonelyActor.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    const tree = response.body.data;
    expect(tree[lonelyActor.id]).toBeDefined();
    expect(tree[lonelyActor.id].children).toEqual([]);
    expect(tree[lonelyActor.id].spouses).toEqual([]);
    expect(tree[lonelyActor.id].siblings).toEqual([]);
  });

  test("Should return a cycle-free tree when cyclic PARENT_CHILD relations exist in DB", async () => {
    const [cycleA, cycleB] = tests.fc.sample(ActorArb, 2).map(toActorEntity);
    await throwTE(Test.ctx.db.save(ActorEntity, [cycleA, cycleB]));

    // Insert the cycle directly into the DB (bypassing API validation)
    await throwTE(
      Test.ctx.db.save(ActorRelationEntity, [
        {
          id: tests.fc.sample(UUIDArb, 1)[0],
          actor: cycleA,
          relatedActor: cycleB,
          type: ActorRelationType.members[0].literals[0],
          startDate: new Date(),
          endDate: null,
          excerpt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: tests.fc.sample(UUIDArb, 1)[0],
          actor: cycleB,
          relatedActor: cycleA,
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

    const response = await Test.req
      .get(`/v1/actor-relations/tree/${cycleA.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    const tree = response.body.data;
    // cycleA is the root: it sees cycleB as a child
    expect(tree[cycleA.id].children).toContain(cycleB.id);
    // cycleB must NOT list cycleA as its child (back-edge stripped)
    expect(tree[cycleB.id].children).not.toContain(cycleA.id);
  });
});
