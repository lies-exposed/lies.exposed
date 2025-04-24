import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { Tag } from "../Tag.js";

describe("Tag codec", () => {
  const decode = Schema.decodeUnknownEither(Schema.Array(Tag));

  test("Should decode given input", () => {
    const tags = ["firstkeyword", "otherkeyword"];

    expect(E.isRight(decode(tags))).toBe(true);

    const fastCheckTest = ["tag", "tag1", "another"];

    expect(E.isRight(decode(fastCheckTest))).toBe(true);
  });

  test("Should failed to decode given input", () => {
    const tags = [
      "not a valid keyword",
      "not-a-valid-keyword",
      "notavalidkeyword$",
      "#not-a-valid-keyword",
      "$notvalid",
    ];

    expect(E.isLeft(decode(tags))).toBe(true);
  });
});
