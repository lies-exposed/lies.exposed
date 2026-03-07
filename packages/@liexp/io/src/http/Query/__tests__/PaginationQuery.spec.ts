import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { PaginationQuery } from "../PaginationQuery.js";

describe("PaginationQuery codec", () => {
  const decode = Schema.decodeUnknownEither(PaginationQuery);

  test("Should decode valid integer pagination values", () => {
    const result = decode({ _start: "0", _end: "10" });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should decode with only _start", () => {
    const result = decode({ _start: "5", _end: null });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should decode with null values (optional)", () => {
    const result = decode({ _start: null, _end: null });
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode non-integer values", () => {
    const result = decode({ _start: "1.5", _end: "10" });
    expect(E.isLeft(result)).toBe(true);
  });

  test("Should fail to decode non-numeric strings", () => {
    const result = decode({ _start: "abc", _end: "10" });
    expect(E.isLeft(result)).toBe(true);
  });
});
