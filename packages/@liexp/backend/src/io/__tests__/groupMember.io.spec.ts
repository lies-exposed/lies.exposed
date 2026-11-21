import { IOError } from "@ts-endpoint/core";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { GroupMemberIO } from "../groupMember.io.js";

describe("GroupMemberIO", () => {
  describe("decodeSingle", () => {
    it("should return Left when actor encoding fails", () => {
      // Deliberately incomplete entities (invalid ids, missing fields) so the
      // codec must reject them; `as never` keeps the invalid payload out of
      // the typed entity surface.
      const invalidGroupMember = {
        id: "invalid",
        actor: { id: "invalid" },
        group: { id: "invalid" },
      };

      const result = GroupMemberIO.decodeSingle(invalidGroupMember as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left when called", () => {
      const result = GroupMemberIO.encodeSingle({});

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        const error = result.left;
        expect(error).toBeInstanceOf(IOError);
      }
    });
  });

  describe("decodeMany", () => {
    it("should return Right with empty array for empty input", () => {
      const result = GroupMemberIO.decodeMany([]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(0);
      }
    });
  });

  describe("encodeMany", () => {
    it("should return empty array when called", () => {
      const result = GroupMemberIO.encodeMany([]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(0);
      }
    });
  });
});
