import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import {
  NonEmptyRecord,
  nonEmptyRecordFromType,
} from "../NonEmptyRecord.js";

describe("NonEmptyRecord", () => {
  const decode = Schema.decodeUnknownEither(NonEmptyRecord);

  test("Should decode a non-empty record", () => {
    const result = decode({ key: "value", count: 1 });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode an empty record", () => {
    const result = decode({});
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should decode a record with mixed value types", () => {
    const result = decode({ a: 1, b: "text", c: null });
    expect(E.isRight(result)).toBe(true);
  });
});

describe("nonEmptyRecordFromType", () => {
  test("Should create a non-empty record schema from struct fields", () => {
    const schema = nonEmptyRecordFromType(
      { name: Schema.String, age: Schema.Number },
      "PersonRecord",
    );
    const result = Schema.decodeUnknownEither(schema)({
      name: "Alice",
      age: 30,
    });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode empty struct", () => {
    const schema = nonEmptyRecordFromType({ name: Schema.String }, "Named");
    const result = Schema.decodeUnknownEither(schema)({});
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should create schema without name parameter", () => {
    const schema = nonEmptyRecordFromType({ value: Schema.Number });
    const result = Schema.decodeUnknownEither(schema)({ value: 42 });
    expect(E.isRight(result)).toBe(true);
  });
});
