import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { KeywordIO } from "../keyword.io.js";

const validKeywordEntity = {
  id: "00000000-0000-0000-0000-000000000001",
  tag: "testkeyword",
  color: "#FF0000",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: null,
};

describe("KeywordIO.decodeSingle", () => {
  it("decodes a valid keyword entity", () => {
    const result = KeywordIO.decodeSingle(validKeywordEntity as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.id).toBe(validKeywordEntity.id);
      expect(result.right.tag).toBe("testkeyword");
    }
  });

  it("handles null deletedAt", () => {
    const result = KeywordIO.decodeSingle({
      ...validKeywordEntity,
      deletedAt: null,
    } as any);

    expect(E.isRight(result)).toBe(true);
  });

  it("preserves Date objects for createdAt and updatedAt", () => {
    const result = KeywordIO.decodeSingle(validKeywordEntity as any);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.createdAt).toBeInstanceOf(Date);
      expect(result.right.updatedAt).toBeInstanceOf(Date);
    }
  });

  it("returns Left when required field is missing", () => {
    const { tag: _tag, ...withoutTag } = validKeywordEntity;
    const result = KeywordIO.decodeSingle(withoutTag as any);

    expect(E.isLeft(result)).toBe(true);
  });
});

describe("KeywordIO.decodeMany", () => {
  it("decodes an array of keyword entities", () => {
    const entities = [
      validKeywordEntity,
      { ...validKeywordEntity, id: "00000000-0000-0000-0000-000000000002" },
    ];
    const result = KeywordIO.decodeMany(entities as any[]);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toHaveLength(2);
    }
  });
});
