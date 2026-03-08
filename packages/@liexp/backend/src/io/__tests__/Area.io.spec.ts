import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { toAreaEntity } from "../../test/utils/entities/index.js";
import { AreaIO } from "../Area.io.js";

describe("AreaIO", () => {
  describe("decodeSingle", () => {
    it("should decode an area entity to Area HTTP type", () => {
      const area = fc.sample(AreaArb, 1)[0];
      const entity = toAreaEntity(area);
      const result = AreaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve area id in the decoded result", () => {
      const area = fc.sample(AreaArb, 1)[0];
      const entity = toAreaEntity(area);
      const result = AreaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(area.id);
      }
    });

    it("should decode area with null featuredImage", () => {
      const area = fc.sample(AreaArb, 1)[0];
      const entity = {
        ...toAreaEntity(area),
        featuredImage: null,
      };
      const result = AreaIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple areas via decodeMany", () => {
      const areas = fc.sample(AreaArb, 3).map(toAreaEntity);
      const result = AreaIO.decodeMany(areas);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should return Right for empty array via decodeMany", () => {
      const result = AreaIO.decodeMany([]);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const area = fc.sample(AreaArb, 1)[0];
      const entity = toAreaEntity(area);
      const result = AreaIO.encodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
