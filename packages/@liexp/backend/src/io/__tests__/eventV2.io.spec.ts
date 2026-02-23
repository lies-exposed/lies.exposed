import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { EventV2IO } from "../event/eventV2.io.js";

const baseEventEntity = {
  id: "00000000-0000-0000-0000-000000000001",
  draft: false,
  date: new Date("2024-01-15T00:00:00.000Z"),
  type: "Uncategorized" as const,
  payload: {
    title: "Test event",
    actors: [],
    groups: [],
    groupsMembers: [],
    keywords: [],
    endDate: undefined,
    location: undefined,
  },
  excerpt: null,
  body: null,
  links: [],
  media: [],
  keywords: [],
  actors: [],
  groups: [],
  groupsMembers: [],
  socialPosts: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: null,
};

describe("EventV2IO.decodeSingle", () => {
  it("decodes a valid uncategorized event entity", () => {
    const result = EventV2IO.decodeSingle(baseEventEntity as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.id).toBe(baseEventEntity.id);
      expect(result.right.type).toBe("Uncategorized");
    }
  });

  it("handles null deletedAt (TypeORM default for not-deleted rows)", () => {
    const result = EventV2IO.decodeSingle({
      ...baseEventEntity,
      deletedAt: null,
    } as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.deletedAt).toBeUndefined();
    }
  });

  it("handles undefined deletedAt", () => {
    const result = EventV2IO.decodeSingle({
      ...baseEventEntity,
      deletedAt: undefined,
    } as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.deletedAt).toBeUndefined();
    }
  });

  it("handles a populated deletedAt Date", () => {
    const deletedAt = new Date("2024-06-01T00:00:00.000Z");
    const result = EventV2IO.decodeSingle({
      ...baseEventEntity,
      deletedAt,
    } as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.deletedAt).toEqual(deletedAt);
    }
  });

  it("handles null socialPosts", () => {
    const result = EventV2IO.decodeSingle({
      ...baseEventEntity,
      socialPosts: null,
    } as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.socialPosts).toEqual([]);
    }
  });

  it("preserves date as Date object", () => {
    const result = EventV2IO.decodeSingle(baseEventEntity as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.date).toBeInstanceOf(Date);
      expect(result.right.createdAt).toBeInstanceOf(Date);
      expect(result.right.updatedAt).toBeInstanceOf(Date);
    }
  });

  it("returns Left when id is missing", () => {
    const { id: _id, ...withoutId } = baseEventEntity;
    const result = EventV2IO.decodeSingle(withoutId as any);

    expect(E.isLeft(result)).toBe(true);
  });
});

describe("EventV2IO.encodeSingle", () => {
  it("returns Left (not implemented)", () => {
    const result = EventV2IO.encodeSingle({} as any);

    expect(E.isLeft(result)).toBe(true);
  });
});
