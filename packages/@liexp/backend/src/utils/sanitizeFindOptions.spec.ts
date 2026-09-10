import { Equal, In, IsNull } from "typeorm";
import { describe, it, expect } from "vitest";
import { sanitizeFindOptions, sanitizeWhere } from "./sanitizeFindOptions.js";

describe("sanitizeFindOptions", () => {
  describe("sanitizeWhere", () => {
    it("drops undefined and null values", () => {
      expect(
        sanitizeWhere({ id: "abc", type: undefined, status: null }),
      ).toEqual({ id: "abc" });
    });

    it("keeps FindOperator, Date and array values untouched", () => {
      const date = new Date();
      const op = Equal("x");
      const isNull = IsNull();
      const result = sanitizeWhere({
        status: op,
        date,
        deletedAt: isNull,
        ids: ["a", "b"],
      });
      expect(result).toEqual({
        status: op,
        date,
        deletedAt: isNull,
        ids: ["a", "b"],
      });
    });

    it("recurses into nested relation criteria", () => {
      expect(
        sanitizeWhere({ actor: { id: Equal("a"), nickname: undefined } }),
      ).toEqual({ actor: { id: Equal("a") } });
    });

    it("removes a nested object that becomes empty", () => {
      expect(sanitizeWhere({ actor: { id: undefined }, id: "keep" })).toEqual({
        id: "keep",
      });
    });

    it("sanitises each entry of an array where and drops empty ones", () => {
      expect(
        sanitizeWhere([{ id: "a", type: undefined }, { type: undefined }]),
      ).toEqual([{ id: "a" }]);
    });

    it("returns undefined when an array where empties completely", () => {
      expect(sanitizeWhere([{ type: undefined }])).toBeUndefined();
    });

    it("returns undefined for undefined / null input", () => {
      expect(sanitizeWhere(undefined)).toBeUndefined();
      expect(sanitizeWhere(null)).toBeUndefined();
    });
  });

  describe("sanitizeFindOptions", () => {
    it("is a no-op when there is no where", () => {
      const opts = { relations: { actor: true } };
      expect(sanitizeFindOptions(opts)).toBe(opts);
    });

    it("passes undefined through untouched", () => {
      expect(sanitizeFindOptions(undefined)).toBeUndefined();
    });

    it("strips undefined/null from where and preserves the rest", () => {
      const result = sanitizeFindOptions({
        where: { resource: In(["a"]), type: undefined, status: undefined },
        relations: { actor: true },
        withDeleted: true,
      });
      expect(result).toEqual({
        where: { resource: In(["a"]) },
        relations: { actor: true },
        withDeleted: true,
      });
    });
  });
});
