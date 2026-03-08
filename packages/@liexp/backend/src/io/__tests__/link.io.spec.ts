import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { toLinkEntity } from "../../test/utils/entities/index.js";
import { LinkIO } from "../link.io.js";

describe("LinkIO", () => {
  describe("decodeSingle", () => {
    it("should decode a link entity to Link HTTP type", () => {
      const link = fc.sample(LinkArb, 1)[0];
      const entity = toLinkEntity(link);
      const result = LinkIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode a link with no image", () => {
      const link = fc.sample(LinkArb, 1)[0];
      const entity = {
        ...toLinkEntity(link),
        image: null,
      };
      const result = LinkIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve the link URL in the decoded result", () => {
      const link = fc.sample(LinkArb, 1)[0];
      const entity = toLinkEntity(link);
      const result = LinkIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(link.id);
      }
    });

    it("should decode multiple links via decodeMany", () => {
      const links = fc.sample(LinkArb, 3).map(toLinkEntity);
      const result = LinkIO.decodeMany(links);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const link = fc.sample(LinkArb, 1)[0];
      const entity = toLinkEntity(link);
      const result = LinkIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
