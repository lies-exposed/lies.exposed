import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import { URL } from "../URL.js";

describe("URL codec", () => {
  const expectRight = (urls: string[]): void => {
    urls.forEach((u) => {
      expect(Schema.decodeUnknownEither(URL)(u), `expected "${u}" to decode`).toMatchObject({
        _tag: "Right",
      });
    });
  };

  const expectLeft = (urls: string[]): void => {
    urls.forEach((u) => {
      expect(Schema.decodeUnknownEither(URL)(u), `expected "${u}" to reject`).toMatchObject({
        _tag: "Left",
      });
    });
  };

  test("Should decode valid HTTP and HTTPS URLs", () => {
    expectRight([
      "https://example.com",
      "http://example.com",
      "https://www.example.com",
      "https://example.com/path/to/page",
      "https://example.com/path?query=1&other=2",
      "https://example.com/path#section",
      "https://sub.domain.example.co.uk/page",
      "https://example.com:8080/path",
      "https://user@example.com/path",
      "https://www.sciencedirect.com/article/12345",
      "http://internal.example.com/dev",
    ]);
  });

  test("Should reject non-URL strings", () => {
    expectLeft([
      "not-a-url",
      "ftp://example.com",
      "just some text",
      "",
      "http://",
      "example.com",
    ]);
  });
});
