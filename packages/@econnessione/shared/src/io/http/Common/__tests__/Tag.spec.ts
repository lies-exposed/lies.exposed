import { fc } from "@econnessione/core/tests";
import * as E from "fp-ts/lib/Either";
import { TagArb } from "../../../../tests/arbitrary/utils.arbitrary";
import { Tag } from "../Tag";

describe("Tag codec", () => {
  test("Should decode given input", () => {
    const tags = ["firstkeyword", "otherkeyword"];
    tags.forEach((k) => {
      expect(E.isRight(Tag.decode(k))).toBe(true);
    });

    fc.sample(TagArb(), 100).forEach((url) => {
      expect(E.isRight(Tag.decode(url))).toBe(true);
    });
  });

  test("Should failed to decode given input", () => {
    const tags = [
      "not a valid keyword",
      "not-a-valid-keyword",
      "notavalidkeyword$",
      "#not-a-valid-keyword",
      "$notvalid",
    ];
    tags.forEach((k) => {
      expect(E.isLeft(Tag.decode(k))).toBe(true);
    });
  });
});
