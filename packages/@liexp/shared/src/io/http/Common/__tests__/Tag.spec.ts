import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { Tag } from "../Tag.js";

describe.skip("Tag codec", () => {
  test("Should decode given input", () => {
    const tags = ["firstkeyword", "otherkeyword"];

    expect(E.isRight(t.array(Tag).decode(tags))).toBe(true);

    const fastCheckTest = ["tag", "tag1", "another"];

    expect(E.isRight(t.array(Tag).decode(fastCheckTest))).toBe(true);
  });

  test("Should failed to decode given input", () => {
    const tags = [
      "not a valid keyword",
      "not-a-valid-keyword",
      "notavalidkeyword$",
      "#not-a-valid-keyword",
      "$notvalid",
    ];

    expect(E.isLeft(t.array(Tag).decode(tags))).toBe(true);
  });
});
