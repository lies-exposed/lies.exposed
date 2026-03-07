import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { MaybeURL, URL } from "../URL.js";

describe("URL codec", () => {
  const decode = Schema.decodeUnknownEither(URL);

  test("Should decode a valid http URL", () => {
    expect(E.isRight(decode("http://example.com"))).toBe(true);
  });

  test("Should decode a valid https URL", () => {
    expect(E.isRight(decode("https://example.com"))).toBe(true);
  });

  test("Should decode a URL with path and query", () => {
    expect(
      E.isRight(decode("https://example.com/path?query=value&other=1")),
    ).toBe(true);
  });

  test("Should fail to decode a non-URL string", () => {
    expect(E.isLeft(decode("not-a-url"))).toBe(true);
  });

  test("Should fail to decode an empty string", () => {
    expect(E.isLeft(decode(""))).toBe(true);
  });

  test("Should fail to decode a string without protocol", () => {
    expect(E.isLeft(decode("example.com/path"))).toBe(true);
  });

  describe("MaybeURL codec", () => {
    const decodeMaybe = Schema.decodeUnknownEither(MaybeURL);

    test("Should decode a valid URL", () => {
      expect(E.isRight(decodeMaybe("https://example.com"))).toBe(true);
    });

    test("Should decode any string as MaybeURL", () => {
      expect(E.isRight(decodeMaybe("not-a-url"))).toBe(true);
    });
  });
});
