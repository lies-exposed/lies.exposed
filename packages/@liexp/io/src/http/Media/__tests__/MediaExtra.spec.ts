import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import {
  ImageMediaExtraMonoid,
  MediaExtra,
  MediaExtraMonoid,
  ThumbnailsExtraMonoid,
} from "../MediaExtra.js";

const validImageExtra = {
  thumbnailWidth: 100,
  thumbnailHeight: 100,
  needRegenerateThumbnail: false,
  thumbnails: ["https://example.com/thumb.jpg"],
  width: 800,
  height: 600,
};

const validVideoExtra = {
  duration: 120,
  thumbnails: undefined,
};

describe("MediaExtra codec", () => {
  const decode = Schema.decodeUnknownEither(MediaExtra);

  test("Should decode a valid ImageMediaExtra", () => {
    const result = decode(validImageExtra);
    expect(E.isRight(result)).toBe(true);
  });

  test("Should decode a valid VideoExtra", () => {
    const result = decode(validVideoExtra);
    expect(E.isRight(result)).toBe(true);
  });

  test("Should fail to decode an invalid object", () => {
    const result = decode({ invalid: "data" });
    expect(E.isLeft(result)).toBe(true);
  });
});

describe("ThumbnailsExtraMonoid", () => {
  test("Should have a valid empty value", () => {
    expect(ThumbnailsExtraMonoid.empty.thumbnailWidth).toBe(0);
    expect(ThumbnailsExtraMonoid.empty.needRegenerateThumbnail).toBe(true);
  });

  test("Should concat two ThumbnailsExtra objects", () => {
    const x = ThumbnailsExtraMonoid.empty;
    const y = {
      thumbnailWidth: 200,
      thumbnailHeight: 200,
      needRegenerateThumbnail: false,
      thumbnails: [],
    };
    const result = ThumbnailsExtraMonoid.concat(x, y);
    expect(result.thumbnailWidth).toBe(200);
    expect(result.needRegenerateThumbnail).toBe(false);
  });
});

describe("ImageMediaExtraMonoid", () => {
  test("Should have a valid empty value", () => {
    expect(ImageMediaExtraMonoid.empty.width).toBe(0);
    expect(ImageMediaExtraMonoid.empty.height).toBe(0);
  });

  test("Should concat two ImageMediaExtra objects", () => {
    const x = ImageMediaExtraMonoid.empty;
    const y = { ...ImageMediaExtraMonoid.empty, width: 1920, height: 1080 };
    const result = ImageMediaExtraMonoid.concat(x, y);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });
});

describe("MediaExtraMonoid", () => {
  test("Should have a valid empty value", () => {
    expect(MediaExtraMonoid.empty).toEqual(ImageMediaExtraMonoid.empty);
  });

  test("Should concat two MediaExtra objects", () => {
    const x = validImageExtra;
    const y = { ...validImageExtra, width: 1920 };
    const result = MediaExtraMonoid.concat(x, y);
    expect(result.width).toBe(1920);
  });

  test("Should return y when x is falsy", () => {
    const result = MediaExtraMonoid.concat(null as any, validImageExtra);
    expect(result).toBe(validImageExtra);
  });

  test("Should return x when y is falsy", () => {
    const result = MediaExtraMonoid.concat(validImageExtra, null as any);
    expect(result).toBe(validImageExtra);
  });
});
