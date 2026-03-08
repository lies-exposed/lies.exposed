import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { toGroupEntity } from "../../test/utils/entities/index.js";
import { GroupIO } from "../group.io.js";

describe("GroupIO", () => {
  describe("decodeSingle", () => {
    it("should decode a group entity to Group HTTP type", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = toGroupEntity(group);
      const result = GroupIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve group id in the decoded result", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = toGroupEntity(group);
      const result = GroupIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(group.id);
      }
    });

    it("should decode group with null avatar", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = {
        ...toGroupEntity(group),
        avatar: null,
      };
      const result = GroupIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode group with null startDate and endDate", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = {
        ...toGroupEntity(group),
        startDate: null,
        endDate: null,
      };
      const result = GroupIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple groups via decodeMany", () => {
      const groups = fc.sample(GroupArb, 3).map(toGroupEntity);
      const result = GroupIO.decodeMany(groups);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should encode a group entity", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = toGroupEntity(group);
      const result = GroupIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should encode a group with null avatar", () => {
      const group = fc.sample(GroupArb, 1)[0];
      const entity = {
        ...toGroupEntity(group),
        avatar: null,
      };
      const result = GroupIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should encode multiple groups via encodeMany", () => {
      const groups = fc.sample(GroupArb, 2).map(toGroupEntity);
      const result = GroupIO.encodeMany(groups);
      expect(E.isRight(result)).toBe(true);
    });
  });
});
