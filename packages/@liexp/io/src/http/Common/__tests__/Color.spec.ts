import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { Color } from "../Color.js";

describe("Color codec", () => {
  const decode = Schema.decodeUnknownEither(Color);

  test("Should decode a valid 6-character hex color without #", () => {
    expect(E.isRight(decode("ff0000"))).toBe(true);
  });

  test("Should decode another valid hex color", () => {
    expect(E.isRight(decode("1a2b3c"))).toBe(true);
  });

  test("Should fail to decode a color with # prefix", () => {
    expect(E.isLeft(decode("#ff0000"))).toBe(true);
  });

  test("Should fail to decode a color shorter than 6 characters", () => {
    expect(E.isLeft(decode("fff"))).toBe(true);
  });

  test("Should fail to decode a color longer than 6 characters", () => {
    expect(E.isLeft(decode("ff00001"))).toBe(true);
  });

  test("Should fail to decode an empty string", () => {
    expect(E.isLeft(decode(""))).toBe(true);
  });
});
