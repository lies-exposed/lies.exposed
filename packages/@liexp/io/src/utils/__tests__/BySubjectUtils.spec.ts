import * as O from "fp-ts/lib/Option.js";
import { describe, expect, test } from "vitest";
import { uuid } from "../../http/Common/UUID.js";
import type { Actor } from "../../http/Actor.js";
import type { Group } from "../../http/Group.js";
import {
  BySubjectUtils,
  findBySubject,
  makeBySubject,
  makeBySubjectId,
} from "../BySubjectUtils.js";

const actorId = uuid();
const groupId = uuid();

const mockActor = { id: actorId } as Actor;
const mockGroup = { id: groupId } as Group;

describe("makeBySubjectId", () => {
  test("Should create an Actor BySubjectId", () => {
    const result = makeBySubjectId("Actor", actorId);
    expect(result.type).toBe("Actor");
    expect(result.id).toBe(actorId);
  });

  test("Should create a Group BySubjectId", () => {
    const result = makeBySubjectId("Group", groupId);
    expect(result.type).toBe("Group");
    expect(result.id).toBe(groupId);
  });
});

describe("makeBySubject", () => {
  test("Should create a ByActor", () => {
    const result = makeBySubject("Actor", mockActor);
    expect(result.type).toBe("Actor");
    expect(result.id).toBe(mockActor);
  });

  test("Should create a ByGroup", () => {
    const result = makeBySubject("Group", mockGroup);
    expect(result.type).toBe("Group");
    expect(result.id).toBe(mockGroup);
  });
});

describe("findBySubject", () => {
  test("Should find an actor when type is Actor", () => {
    const subjectId = { type: "Actor" as const, id: actorId };
    const result = findBySubject(subjectId, [mockActor], []);
    expect(result).toBe(mockActor);
  });

  test("Should return undefined when actor not found", () => {
    const otherId = uuid();
    const subjectId = { type: "Actor" as const, id: otherId };
    const result = findBySubject(subjectId, [mockActor], []);
    expect(result).toBeUndefined();
  });

  test("Should find a group when type is Group", () => {
    const subjectId = { type: "Group" as const, id: groupId };
    const result = findBySubject(subjectId, [], [mockGroup]);
    expect(result).toBe(mockGroup);
  });

  test("Should return undefined when group not found", () => {
    const otherId = uuid();
    const subjectId = { type: "Group" as const, id: otherId };
    const result = findBySubject(subjectId, [], [mockGroup]);
    expect(result).toBeUndefined();
  });
});

describe("BySubjectUtils.toBySubjectArray", () => {
  test("Should convert actor subject IDs to BySubject array", () => {
    const subjectIds = [{ type: "Actor" as const, id: actorId }];
    const result = BySubjectUtils.toBySubjectArray(
      subjectIds,
      [mockActor],
      [],
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Actor");
  });

  test("Should convert group subject IDs to BySubject array", () => {
    const subjectIds = [{ type: "Group" as const, id: groupId }];
    const result = BySubjectUtils.toBySubjectArray(
      subjectIds,
      [],
      [mockGroup],
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Group");
  });

  test("Should skip subjects not found in actors or groups", () => {
    const unknownId = uuid();
    const subjectIds = [{ type: "Actor" as const, id: unknownId }];
    const result = BySubjectUtils.toBySubjectArray(
      subjectIds,
      [mockActor],
      [],
    );
    expect(result).toHaveLength(0);
  });
});

describe("BySubjectUtils.lookupForSubject", () => {
  test("Should return Some when actor subject is found", () => {
    const subject = { type: "Actor" as const, id: actorId };
    const result = BySubjectUtils.lookupForSubject(subject, [mockActor], []);
    expect(O.isSome(result)).toBe(true);
  });

  test("Should return None when actor subject is not found", () => {
    const subject = { type: "Actor" as const, id: uuid() };
    const result = BySubjectUtils.lookupForSubject(subject, [mockActor], []);
    expect(O.isNone(result)).toBe(true);
  });

  test("Should return Some when group subject is found", () => {
    const subject = { type: "Group" as const, id: groupId };
    const result = BySubjectUtils.lookupForSubject(subject, [], [mockGroup]);
    expect(O.isSome(result)).toBe(true);
  });
});

describe("BySubjectUtils.toSubjectId", () => {
  test("Should convert an actor BySubject to BySubjectId", () => {
    const bySubject = { type: "Actor" as const, id: mockActor };
    const result = BySubjectUtils.toSubjectId(bySubject);
    expect(result.type).toBe("Actor");
    expect(result.id).toBe(actorId);
  });

  test("Should convert a group BySubject to BySubjectId", () => {
    const bySubject = { type: "Group" as const, id: mockGroup };
    const result = BySubjectUtils.toSubjectId(bySubject);
    expect(result.type).toBe("Group");
    expect(result.id).toBe(groupId);
  });
});

describe("BySubjectUtils.toSubjectIds", () => {
  test("Should convert an array of BySubject to BySubjectId array", () => {
    const bySubjects = [
      { type: "Actor" as const, id: mockActor },
      { type: "Group" as const, id: mockGroup },
    ];
    const result = BySubjectUtils.toSubjectIds(bySubjects);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("Actor");
    expect(result[1].type).toBe("Group");
  });

  test("Should return empty array for empty input", () => {
    const result = BySubjectUtils.toSubjectIds([]);
    expect(result).toHaveLength(0);
  });
});
