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

  describe("date columns returned by the driver", () => {
    const baseEntity = () => toMediaEntity(fc.sample(MediaArb, 1)[0]);

    it("should decode string dates instead of throwing on .toISOString()", () => {
      const entity = {
        ...baseEntity(),
        createdAt: "2026-11-14 16:01:00.000",
        updatedAt: "2026-11-14 16:01:00.000",
      };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.createdAt).toBeInstanceOf(Date);
        // The driver string carries no zone, so it is read as local time, the
        // same way node-postgres parses `timestamp without time zone`.
        expect(result.right.createdAt).toEqual(new Date(2026, 10, 14, 16, 1));
      }
    });

    it("should decode NaT deletedAt as a Left, not a throw", () => {
      const entity = { ...baseEntity(), deletedAt: new Date(NaN) };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.name).toBe("DecodeError");
        expect(result.left.message).toContain(`media (${entity.id})`);
        expect(result.left.message).toContain("deletedAt=NaT");
      }
    });

    it("should decode a required date column that came back null as a Left", () => {
      const entity = { ...baseEntity(), createdAt: null as unknown as Date };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toContain("createdAt=null");
      }
    });

    it("should decode an unparseable date string as a Left naming the field", () => {
      const entity = { ...baseEntity(), updatedAt: "0000-00-00 00:00:00" };
      const result = MediaIO.decodeSingle(entity);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toContain(
          'updatedAt="0000-00-00 00:00:00"',
        );
      }
    });

    it("should return a Left from decodeMany instead of escaping the Either", () => {
      const entities = [
        baseEntity(),
        { ...baseEntity(), updatedAt: new Date(NaN) },
      ];
      const result = MediaIO.decodeMany(entities);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should encode string dates instead of throwing on .toISOString()", () => {
      const entity = {
        ...baseEntity(),
        createdAt: "2026-11-14 16:01:00.000",
        updatedAt: "2026-11-14 16:01:00.000",
      };
      const result = MediaIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(typeof result.right.createdAt).toBe("string");
      }
    });

    it("should encode a NaT date as a Left, not a throw", () => {
      const entity = { ...baseEntity(), createdAt: new Date(NaN) };
      const result = MediaIO.encodeSingle(entity);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toContain("createdAt=NaT");
      }
    });

    it("should round-trip normal Date rows", () => {
      const entity = baseEntity();
      expect(E.isRight(MediaIO.decodeSingle(entity))).toBe(true);
      expect(E.isRight(MediaIO.encodeSingle(entity))).toBe(true);
    });
  });
});
