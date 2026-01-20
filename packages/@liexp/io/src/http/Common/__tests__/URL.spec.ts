import { Schema } from "effect";
import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { URL } from "../URL.js";

describe("URL codec", () => {
  const expectAll = (urls: string[]): void => {
    urls.forEach((u) => {
      expect(Schema.decodeUnknownEither(URL)(u)).toMatchObject({
        _tag: "Right",
      });
    });
  };

  test.skip("Should decode given input", () => {
    expectAll(fc.sample(fc.webUrl({ size: "small" }), 10));

    expectAll(fc.sample(fc.webUrl({ size: "medium" }), 10));

    expectAll(fc.sample(fc.webUrl({ size: "large" }), 10));
  });
});
