import * as O from "fp-ts/lib/Option.js";
import { describe, it, expect } from "vitest";
import { foldOptionals, optionalsToUndefined } from "./foldOptionals.utils.js";

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
  });

  describe("optionalsToUndefined", () => {
    it("should map Some values to their unwrapped value", () => {
      const obj = {
        name: O.some("alice"),
        age: O.some(30),
      };

      const result = optionalsToUndefined(obj);

      expect(result.name).toBe("alice");
      expect(result.age).toBe(30);
    });

    it("should map None values to undefined", () => {
      const obj = {
        name: O.some("alice"),
        role: O.none,
      };

      const result = optionalsToUndefined(obj);

      expect(result.name).toBe("alice");
      expect(result.role).toBeUndefined();
    });

    it("should return all keys including those mapped to undefined", () => {
      const obj = {
        present: O.some("value"),
        absent: O.none,
      };

      const result = optionalsToUndefined(obj);

      expect(Object.keys(result)).toContain("present");
      expect(Object.keys(result)).toContain("absent");
    });

    it("should handle an empty object", () => {
      const result = optionalsToUndefined({});

      expect(result).toEqual({});
    });

    it("should handle all None values", () => {
      const obj = {
        a: O.none,
        b: O.none,
      };

      const result = optionalsToUndefined(obj);

      expect(result.a).toBeUndefined();
      expect(result.b).toBeUndefined();
    });

    it("should handle all Some values", () => {
      const obj = {
        x: O.some(1),
        y: O.some(2),
      };

      const result = optionalsToUndefined(obj);

      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
    });

    it("should handle Some with object values", () => {
      const obj = {
        config: O.some({ timeout: 30, retries: 3 }),
        tag: O.none,
      };

      const result = optionalsToUndefined(obj);

      expect(result.config).toEqual({ timeout: 30, retries: 3 });
      expect(result.tag).toBeUndefined();
    });
  });
});
