import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { ListOutput, Output } from "../Output.js";

describe("Output", () => {
  test("Should create an Output schema and decode valid data", () => {
    const outputSchema = Output(Schema.String);
    const result = Schema.decodeUnknownEither(outputSchema)({ data: "hello" });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode invalid data", () => {
    const outputSchema = Output(Schema.Number);
    const result = Schema.decodeUnknownEither(outputSchema)({
      data: "not-a-number",
    });
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should work with complex inner schema", () => {
    const innerSchema = Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
    });
    const outputSchema = Output(innerSchema);
    const result = Schema.decodeUnknownEither(outputSchema)({
      data: { id: 1, name: "test" },
    });
    expect(E.isRight(result)).toBe(true);
  });
});

describe("ListOutput", () => {
  test("Should create a ListOutput schema and decode valid data", () => {
    const listSchema = ListOutput(Schema.String, "StringList");
    const result = Schema.decodeUnknownEither(listSchema)({
      data: ["a", "b", "c"],
      total: 3,
    });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should decode empty list", () => {
    const listSchema = ListOutput(Schema.Number, "NumberList");
    const result = Schema.decodeUnknownEither(listSchema)({
      data: [],
      total: 0,
    });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail when total is missing", () => {
    const listSchema = ListOutput(Schema.String, "StringList");
    const result = Schema.decodeUnknownEither(listSchema)({ data: ["a"] });
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should fail when data is not an array", () => {
    const listSchema = ListOutput(Schema.String, "StringList");
    const result = Schema.decodeUnknownEither(listSchema)({
      data: "not-array",
      total: 1,
    });
    expect(E.isLeft(result)).toBe(true);
  });
});
