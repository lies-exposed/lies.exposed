import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { ActorRelationEntity } from "../../entities/ActorRelation.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { buildActorRelationTree } from "./buildActorRelationTree.flow.js";

type BuildActorRelationTreeContext = DatabaseContext & LoggerContext;

describe(buildActorRelationTree.name, () => {
  const mockDb = mockDeep<DatabaseContext["db"]>();

  const ctx = mockedContext<BuildActorRelationTreeContext>({
    db: mockDb,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a tree map with a single actor and no relations", async () => {
    const actorId = "actor-1";

    const actor = new ActorEntity();
    actor.id = actorId;
    actor.username = "testuser";
    actor.fullName = "Test User";
    actor.avatar = null;
    actor.bornOn = null;
    actor.diedOn = null;

    // findOneOrFail – root actor existence check
    mockTERightOnce(mockDb.findOneOrFail, () => actor);
    // Batch 1: fetch actors for level 0
    mockTERightOnce(mockDb.find, () => [actor]);
    // Batch 2: fetch relations touching actorId (none)
    mockTERightOnce(mockDb.find, () => []);
    // No Batch 3 (allParentIds is empty)

    const result = await pipe(buildActorRelationTree(actorId, 0)(ctx), throwTE);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result[actorId]).toBeDefined();
    expect(result[actorId].id).toBe(actorId);
    expect(result[actorId].name).toBe("testuser");
    expect(result[actorId].fullName).toBe("Test User");
    expect(result[actorId].children).toEqual([]);
    expect(result[actorId].parents).toEqual([]);
    expect(result[actorId].spouses).toEqual([]);
    expect(result[actorId].siblings).toEqual([]);
  });

  it("should include actor avatar location in the tree node", async () => {
    const actorId = "actor-avatar";

    const avatarMedia = { location: "https://example.com/avatar.jpg" } as any;

    const actor = new ActorEntity();
    actor.id = actorId;
    actor.username = "avataruser";
    actor.fullName = "Avatar User";
    actor.avatar = avatarMedia;
    actor.bornOn = null;
    actor.diedOn = null;

    mockTERightOnce(mockDb.findOneOrFail, () => actor);
    mockTERightOnce(mockDb.find, () => [actor]);
    mockTERightOnce(mockDb.find, () => []);

    const result = await pipe(buildActorRelationTree(actorId, 0)(ctx), throwTE);

    expect(result[actorId].avatar).toBe("https://example.com/avatar.jpg");
  });

  it("should populate children when a PARENT_CHILD relation exists", async () => {
    const parentId = "actor-parent";
    const childId = "actor-child";

    const parent = new ActorEntity();
    parent.id = parentId;
    parent.username = "parent";
    parent.fullName = "Parent Actor";
    parent.avatar = null;
    parent.bornOn = null;
    parent.diedOn = null;

    const child = new ActorEntity();
    child.id = childId;
    child.username = "child";
    child.fullName = "Child Actor";

    // PARENT_CHILD: actor = parent, relatedActor = child
    const relation = new ActorRelationEntity();
    relation.type = "PARENT_CHILD" as any;
    relation.actor = parent;
    relation.relatedActor = child;

    // findOneOrFail – root actor
    mockTERightOnce(mockDb.findOneOrFail, () => parent);
    // Batch 1: actors for level 0 = [parent]
    mockTERightOnce(mockDb.find, () => [parent]);
    // Batch 2: relations touching parentId = [PARENT_CHILD]
    mockTERightOnce(mockDb.find, () => [relation]);
    // No Batch 3 – parentId has no parents so allParentIds is empty

    // For level 1 (depth = 1 > maxDepth = 0), processLevel returns immediately
    const result = await pipe(
      buildActorRelationTree(parentId, 0)(ctx),
      throwTE,
    );

    expect(result[parentId]).toBeDefined();
    expect(result[parentId].children).toContain(childId);
    expect(result[parentId].parents).toEqual([]);
  });

  it("should populate parents and trigger sibling query when actor has a parent", async () => {
    const parentId = "actor-parent-2";
    const actorId = "actor-child-2";

    const parent = new ActorEntity();
    parent.id = parentId;
    parent.username = "parent2";
    parent.fullName = "Parent Two";
    parent.avatar = null;
    parent.bornOn = null;
    parent.diedOn = null;

    const actor = new ActorEntity();
    actor.id = actorId;
    actor.username = "child2";
    actor.fullName = "Child Two";
    actor.avatar = null;
    actor.bornOn = null;
    actor.diedOn = null;

    // PARENT_CHILD: actor = parent, relatedActor = actor(child)
    const relation = new ActorRelationEntity();
    relation.type = "PARENT_CHILD" as any;
    relation.actor = parent;
    relation.relatedActor = actor;

    // findOneOrFail – root actor (actor = child)
    mockTERightOnce(mockDb.findOneOrFail, () => actor);
    // Batch 1: actors for level 0 = [actor]
    mockTERightOnce(mockDb.find, () => [actor]);
    // Batch 2: relations touching actorId = [PARENT_CHILD]
    mockTERightOnce(mockDb.find, () => [relation]);
    // Batch 3: sibling query – parent's children (no other siblings)
    mockTERightOnce(mockDb.find, () => [relation]);

    const result = await pipe(buildActorRelationTree(actorId, 0)(ctx), throwTE);

    expect(result[actorId]).toBeDefined();
    expect(result[actorId].parents).toContain(parentId);
    expect(result[actorId].children).toEqual([]);
  });

  it("should populate spouses when a SPOUSE relation exists", async () => {
    const actor1Id = "actor-spouse-1";
    const actor2Id = "actor-spouse-2";

    const actor1 = new ActorEntity();
    actor1.id = actor1Id;
    actor1.username = "spouse1";
    actor1.fullName = "Spouse One";
    actor1.avatar = null;
    actor1.bornOn = null;
    actor1.diedOn = null;

    const actor2 = new ActorEntity();
    actor2.id = actor2Id;
    actor2.username = "spouse2";
    actor2.fullName = "Spouse Two";

    const relation = new ActorRelationEntity();
    relation.type = "SPOUSE" as any;
    relation.actor = actor1;
    relation.relatedActor = actor2;

    mockTERightOnce(mockDb.findOneOrFail, () => actor1);
    mockTERightOnce(mockDb.find, () => [actor1]);
    mockTERightOnce(mockDb.find, () => [relation]);
    // No Batch 3 (no parents)

    const result = await pipe(
      buildActorRelationTree(actor1Id, 0)(ctx),
      throwTE,
    );

    expect(result[actor1Id]).toBeDefined();
    expect(result[actor1Id].spouses).toContain(actor2Id);
    expect(result[actor1Id].children).toEqual([]);
  });

  it("should return error when root actor does not exist", async () => {
    const actorId = "non-existent";

    const dbError = new Error("Entity not found");
    mockDb.findOneOrFail.mockImplementationOnce(
      () => () => Promise.resolve({ _tag: "Left", left: dbError } as any),
    );

    const result = await buildActorRelationTree(actorId, 0)(ctx)();

    expect(result._tag).toBe("Left");
  });

  it("should build multi-level tree up to maxDepth", async () => {
    const grandparentId = "actor-gp";
    const parentId = "actor-p";
    const childId = "actor-c";

    const grandparent = new ActorEntity();
    grandparent.id = grandparentId;
    grandparent.username = "grandparent";
    grandparent.fullName = "Grand Parent";
    grandparent.avatar = null;
    grandparent.bornOn = null;
    grandparent.diedOn = null;

    const parent = new ActorEntity();
    parent.id = parentId;
    parent.username = "parent";
    parent.fullName = "Parent";
    parent.avatar = null;
    parent.bornOn = null;
    parent.diedOn = null;

    const child = new ActorEntity();
    child.id = childId;
    child.username = "child";
    child.fullName = "Child";
    child.avatar = null;
    child.bornOn = null;
    child.diedOn = null;

    // GP → P: grandparent is parent of parent
    const rel1 = new ActorRelationEntity();
    rel1.type = "PARENT_CHILD" as any;
    rel1.actor = grandparent;
    rel1.relatedActor = parent;

    // P → C: parent is parent of child
    const rel2 = new ActorRelationEntity();
    rel2.type = "PARENT_CHILD" as any;
    rel2.actor = parent;
    rel2.relatedActor = child;

    // findOneOrFail – root = grandparent
    mockTERightOnce(mockDb.findOneOrFail, () => grandparent);

    // Level 0: processLevel([grandparentId], 0)
    // Batch 1: actors = [grandparent]
    mockTERightOnce(mockDb.find, () => [grandparent]);
    // Batch 2: relations for grandparentId
    mockTERightOnce(mockDb.find, () => [rel1]);
    // No Batch 3 (grandparent has no parents → allParentIds empty)

    // Level 1: processLevel([parentId], 1) with maxDepth=1
    // Batch 1: actors = [parent]
    mockTERightOnce(mockDb.find, () => [parent]);
    // Batch 2: relations for parentId (includes rel1 and rel2)
    mockTERightOnce(mockDb.find, () => [rel1, rel2]);
    // Batch 3: sibling query for grandparentId (parent of parentId)
    mockTERightOnce(mockDb.find, () => [rel1]);

    // Level 2: processLevel([childId], 2) → depth(2) > maxDepth(1) → returns immediately

    const result = await pipe(
      buildActorRelationTree(grandparentId, 1)(ctx),
      throwTE,
    );

    expect(result[grandparentId]).toBeDefined();
    expect(result[grandparentId].children).toContain(parentId);

    expect(result[parentId]).toBeDefined();
    expect(result[parentId].parents).toContain(grandparentId);
    expect(result[parentId].children).toContain(childId);

    // childId was not visited (depth exceeded)
    expect(result[childId]).toBeUndefined();
  });
});
