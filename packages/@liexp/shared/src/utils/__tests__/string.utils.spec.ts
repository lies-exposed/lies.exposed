import { describe, expect, it } from "vitest";
import { firstNonEmpty } from "../string.utils.js";

describe("string.utils", () => {
  describe("firstNonEmpty", () => {
    it("should return the first non-empty string", () => {
      expect(firstNonEmpty("", "foo", "bar")).toBe("foo");
    });

    it("should skip null and undefined values", () => {
      expect(firstNonEmpty(null, undefined, "bar")).toBe("bar");
    });

    it("should return undefined when all values are empty/null/undefined", () => {
      expect(firstNonEmpty("", null)).toBeUndefined();
      expect(firstNonEmpty(undefined, null)).toBeUndefined();
      expect(firstNonEmpty("", "", "")).toBeUndefined();
      expect(firstNonEmpty()).toBeUndefined();
    });

    it("should return the first value if it is non-empty", () => {
      expect(firstNonEmpty("hello", "world")).toBe("hello");
    });

    it("should treat whitespace-only strings as non-empty", () => {
      expect(firstNonEmpty("", " ", "bar")).toBe(" ");
    });

    it("should handle a single non-empty value", () => {
      expect(firstNonEmpty("single")).toBe("single");
    });

    it("should handle a single empty value", () => {
      expect(firstNonEmpty("")).toBeUndefined();
    });
  });
});
