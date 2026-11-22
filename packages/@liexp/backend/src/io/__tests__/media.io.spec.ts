import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import {
  toKeywordEntity,
  toMediaEntity,
} from "../../test/utils/entities/index.js";
import { MediaIO } from "../media.io.js";

describe("MediaIO", () => {
  describe("decodeSingle", () => {
    it("should decode a media entity to AdminMedia HTTP type", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const entity = toMediaEntity(media);
      const result = MediaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode with null thumbnail", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const entity = {
        ...toMediaEntity(media),
        thumbnail: null,
      };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should include the media location in the decoded result", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const entity = toMediaEntity(media);
      const result = MediaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(media.id);
      }
    });
  });

  describe("decodeSingle with joined relations", () => {
    it("should decode keywords loaded as entities into UUIDs", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const keywords = fc.sample(KeywordArb, 2).map(toKeywordEntity);
      const entity = { ...toMediaEntity(media), keywords };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.keywords).toEqual(keywords.map((k) => k.id));
      }
    });
  });

  describe("decodeMany", () => {
    it("should decode an array of media entities", () => {
      const entities = fc.sample(MediaArb, 3).map(toMediaEntity);
      const result = MediaIO.decodeMany(entities);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should return Right for empty array", () => {
      const result = MediaIO.decodeMany([]);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should encode a media entity to AdminMedia encoded type", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const entity = toMediaEntity(media);
      const result = MediaIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should include createdAt as ISO string in encoded result", () => {
      const media = fc.sample(MediaArb, 1)[0];
      const entity = toMediaEntity(media);
      const result = MediaIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(typeof result.right.createdAt).toBe("string");
      }
    });
  });

  describe("encodeMany", () => {
    it("should encode an array of media entities", () => {
      const entities = fc.sample(MediaArb, 2).map(toMediaEntity);
      const result = MediaIO.encodeMany(entities);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(2);
      }
    });
  });
});
