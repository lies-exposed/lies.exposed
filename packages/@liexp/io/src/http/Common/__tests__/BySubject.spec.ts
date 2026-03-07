import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { ByActor, ByGroup, BySubject, BySubjectId } from "../BySubject.js";
import { uuid } from "../UUID.js";

const actorId = uuid();
const groupId = uuid();

describe("BySubjectId codec", () => {
  const decode = Schema.decodeUnknownEither(BySubjectId);

  test("Should decode a ByActorId", () => {
    const result = decode({ type: "Actor", id: actorId });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should decode a ByGroupId", () => {
    const result = decode({ type: "Group", id: groupId });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode invalid type", () => {
    const result = decode({ type: "Invalid", id: actorId });
    expect(E.isLeft(result)).toBe(true);
  });
});

describe("ByActor codec", () => {
  const decode = Schema.decodeUnknownEither(ByActor);

  test("Should fail when actor id is not a full actor object", () => {
    // This triggers Schema.suspend to evaluate the lazy Actor schema
    const result = decode({ type: "Actor", id: { id: actorId } });
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should fail when type does not match", () => {
    const result = decode({ type: "Group", id: {} });
    expect(E.isLeft(result)).toBe(true);
  });
});

describe("ByGroup codec", () => {
  const decode = Schema.decodeUnknownEither(ByGroup);

  test("Should fail when group data is invalid", () => {
    const result = decode({ type: "Group", id: { invalid: "data" } });
    expect(E.isLeft(result)).toBe(true);
  });
});

describe("BySubject codec", () => {
  const decode = Schema.decodeUnknownEither(BySubject);

  test("Should fail when actor fields are missing", () => {
    // Triggers Schema.suspend for Actor to attempt decoding
    const result = decode({ type: "Actor", id: { id: actorId } });
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should fail to decode invalid subject", () => {
    const result = decode({ type: "Unknown", id: {} });
    expect(E.isLeft(result)).toBe(true);
  });
});
