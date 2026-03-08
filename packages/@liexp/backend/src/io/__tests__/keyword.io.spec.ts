import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { toKeywordEntity } from "../../test/utils/entities/index.js";
import { KeywordIO } from "../keyword.io.js";

describe("KeywordIO", () => {
  describe("decodeSingle", () => {
    it("should decode a keyword entity to Keyword HTTP type", () => {
      const keyword = fc.sample(KeywordArb, 1)[0];
      const entity = toKeywordEntity(keyword);
      const result = KeywordIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode with null color falling back to 000000", () => {
      const keyword = fc.sample(KeywordArb, 1)[0];
      const entity = {
        ...toKeywordEntity(keyword),
        color: null as any,
      };
      const result = KeywordIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode a manually constructed keyword entity", () => {
      const entity = {
        id: uuid(),
        tag: "testkeyword" as any, // Tag must be alphanumeric only (no hyphens)
        color: "#ff0000" as any,
        socialPosts: [],
        events: [],
        links: [],
        stories: [],
        media: [],
        eventCount: 0,
        linkCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const result = KeywordIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple keywords via decodeMany", () => {
      const keywords = fc.sample(KeywordArb, 3).map(toKeywordEntity);
      const result = KeywordIO.decodeMany(keywords);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should include the tag in the decoded keyword", () => {
      const keyword = fc.sample(KeywordArb, 1)[0];
      const entity = toKeywordEntity(keyword);
      const result = KeywordIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.tag).toBe(keyword.tag);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const keyword = fc.sample(KeywordArb, 1)[0];
      const entity = toKeywordEntity(keyword);
      const result = KeywordIO.encodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
