import { describe, it, expect } from "vitest";
import { JSONOperators } from "./utils.js";

describe("orm/utils", () => {
  describe("JSONOperators.Strings.Eq", () => {
    it("should produce a JSONB equality expression for a single path", () => {
      const result = JSONOperators.Strings.Eq("entity.data", ["key"], "myValue");

      expect(result).toContain("entity.data::jsonb");
      expect(result).toContain("'myValue'");
    });

    it("should include the field value in the expression", () => {
      const result = JSONOperators.Strings.Eq("table.col", ["path"], "value123");

      expect(result).toContain("value123");
    });

    it("should use ->> operator for the last path element", () => {
      const result = JSONOperators.Strings.Eq("entity.data", ["key"], "val");

      expect(result).toContain("->>");
    });

    it("should produce an equality check with = operator", () => {
      const result = JSONOperators.Strings.Eq("t.col", ["k"], "v");

      expect(result).toContain("= 'v'");
    });

    it("should include the path key in the expression", () => {
      const result = JSONOperators.Strings.Eq("entity.data", ["myField"], "value");

      expect(result).toContain("'myField'");
    });

    it("should handle multiple path segments", () => {
      const result = JSONOperators.Strings.Eq(
        "entity.data",
        ["level1", "level2"],
        "deepValue",
      );

      expect(result).toContain("'level1'");
      expect(result).toContain("'level2'");
      expect(result).toContain("deepValue");
    });
  });

  describe("JSONOperators.Array.every", () => {
    it("should produce a ?& (contains all) JSONB operator expression", () => {
      const result = JSONOperators.Array.every("entity.tags", ["items"], "tagValues");

      expect(result).toContain("?& ARRAY[:...tagValues]");
    });

    it("should include the column with ::jsonb cast", () => {
      const result = JSONOperators.Array.every("entity.tags", ["items"], "tagValues");

      expect(result).toContain("entity.tags::jsonb");
    });

    it("should include the path in the expression", () => {
      const result = JSONOperators.Array.every("t.col", ["myPath"], "key");

      expect(result).toContain("'myPath'");
    });

    it("should include the valueKey in the ARRAY spread", () => {
      const result = JSONOperators.Array.every("t.col", ["p"], "myKey");

      expect(result).toContain("[:...myKey]");
    });

    it("should use -> operator to navigate the path", () => {
      const result = JSONOperators.Array.every("t.col", ["arr"], "vals");

      expect(result).toContain("->");
    });

    it("should handle multiple path segments", () => {
      const result = JSONOperators.Array.every(
        "entity.data",
        ["nested", "array"],
        "vals",
      );

      expect(result).toContain("'nested'");
      expect(result).toContain("'array'");
    });
  });

  describe("JSONOperators.Array.some", () => {
    it("should produce a ?| (contains any) JSONB operator expression", () => {
      const result = JSONOperators.Array.some("entity.tags", ["items"], "tagValues");

      expect(result).toContain("?| ARRAY[:...tagValues]");
    });

    it("should include the column with ::jsonb cast", () => {
      const result = JSONOperators.Array.some("entity.tags", ["items"], "tagValues");

      expect(result).toContain("entity.tags::jsonb");
    });

    it("should include the path in the expression", () => {
      const result = JSONOperators.Array.some("t.col", ["myPath"], "key");

      expect(result).toContain("'myPath'");
    });

    it("should include the valueKey in the ARRAY spread", () => {
      const result = JSONOperators.Array.some("t.col", ["p"], "myKey");

      expect(result).toContain("[:...myKey]");
    });

    it("should differ from the every expression (uses ?| instead of ?&)", () => {
      const everyResult = JSONOperators.Array.every("t.col", ["arr"], "vals");
      const someResult = JSONOperators.Array.some("t.col", ["arr"], "vals");

      expect(everyResult).not.toBe(someResult);
      expect(everyResult).toContain("?&");
      expect(someResult).toContain("?|");
    });

    it("should handle multiple path segments", () => {
      const result = JSONOperators.Array.some(
        "entity.data",
        ["nested", "array"],
        "vals",
      );

      expect(result).toContain("'nested'");
      expect(result).toContain("'array'");
    });
  });
});
