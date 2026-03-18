import * as O from "fp-ts/lib/Option.js";
import { describe, it, expect } from "vitest";
import { foldOptionals } from "./foldOptionals.utils.js";

describe("foldOptionals.utils", () => {
  describe("foldOptionals", () => {
    it("should keep only Some values", () => {
      const obj = {
        name: O.some("alice"),
        age: O.some(30),
        role: O.none,
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({ name: "alice", age: 30 });
    });

    it("should return empty object when all values are None", () => {
      const obj = {
        a: O.none,
        b: O.none,
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({});
    });

    it("should return all values when all are Some", () => {
      const obj = {
        x: O.some("hello"),
        y: O.some("world"),
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({ x: "hello", y: "world" });
    });

    it("should handle an empty object", () => {
      const result = foldOptionals({});

      expect(result).toEqual({});
    });

    it("should handle Some with falsy values", () => {
      const obj = {
        zero: O.some(0),
        empty: O.some(""),
        falsy: O.some(false),
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({ zero: 0, empty: "", falsy: false });
    });

    it("should handle Some with object values", () => {
      const obj = {
        nested: O.some({ id: "1", label: "test" }),
        missing: O.none,
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({ nested: { id: "1", label: "test" } });
    });

    it("should not include None keys in the result", () => {
      const obj = {
        present: O.some("here"),
        absent: O.none,
      };

      const result = foldOptionals(obj);

      expect(Object.keys(result)).toContain("present");
      expect(Object.keys(result)).not.toContain("absent");
    });

    it("should handle mixed Some and None values", () => {
      const obj = {
        first: O.none,
        second: O.some("value"),
        third: O.none,
        fourth: O.some(42),
      };

      const result = foldOptionals(obj);

      expect(result).toEqual({ second: "value", fourth: 42 });
    });

    it("should preserve types correctly", () => {
      const obj = {
        str: O.some("string"),
        num: O.none,
        bool: O.some(true),
        arr: O.some([1, 2, 3]),
      };

      const result = foldOptionals(obj);

      expect(typeof result.str).toBe("string");
      expect(typeof result.bool).toBe("boolean");
      expect(Array.isArray(result.arr)).toBe(true);
    });
  });
});
