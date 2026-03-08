import { describe, it, expect, vi } from "vitest";
import {
  buildFTSWhere,
  buildFTSWhereRaw,
  applyFTSWhere,
  blockNoteTextExpr,
} from "./search.utils.js";

describe("search.utils", () => {
  describe("buildFTSWhere", () => {
    it("should return a whereClause and params object", () => {
      const result = buildFTSWhere(["actor.fullName"], "alice");

      expect(result).toHaveProperty("whereClause");
      expect(result).toHaveProperty("params");
    });

    it("should include the search term in params as ftsQ", () => {
      const searchTerm = "my search term";
      const result = buildFTSWhere(["actor.fullName"], searchTerm);

      expect(result.params).toEqual({ ftsQ: searchTerm });
    });

    it("should wrap fields with coalesce and ::text cast", () => {
      const result = buildFTSWhere(["actor.fullName"], "test");

      expect(result.whereClause).toContain("coalesce(actor.fullName::text, '')");
    });

    it("should join multiple fields with || concatenation", () => {
      const result = buildFTSWhere(
        ["actor.fullName", "actor.username"],
        "test",
      );

      expect(result.whereClause).toContain("coalesce(actor.fullName::text, '')");
      expect(result.whereClause).toContain("coalesce(actor.username::text, '')");
      expect(result.whereClause).toContain("|| ' ' ||");
    });

    it("should use ts_rank_cd and websearch_to_tsquery in the where clause", () => {
      const result = buildFTSWhere(["actor.fullName"], "test");

      expect(result.whereClause).toContain("ts_rank_cd(");
      expect(result.whereClause).toContain("websearch_to_tsquery('simple', :ftsQ)");
      expect(result.whereClause).toContain("to_tsvector('simple',");
    });

    it("should have a threshold of > 0 in the where clause", () => {
      const result = buildFTSWhere(["actor.fullName"], "test");

      expect(result.whereClause).toContain("> 0");
    });

    it("should handle a single field correctly", () => {
      const result = buildFTSWhere(["event.title"], "climate");

      expect(result.whereClause).toContain("coalesce(event.title::text, '')");
      expect(result.params.ftsQ).toBe("climate");
    });

    it("should handle three or more fields", () => {
      const result = buildFTSWhere(
        ["a.col1", "a.col2", "a.col3"],
        "query",
      );

      expect(result.whereClause).toContain("coalesce(a.col1::text, '')");
      expect(result.whereClause).toContain("coalesce(a.col2::text, '')");
      expect(result.whereClause).toContain("coalesce(a.col3::text, '')");
    });
  });

  describe("buildFTSWhereRaw", () => {
    it("should return a whereClause and params object", () => {
      const result = buildFTSWhereRaw("coalesce(my_expr, '')", "term");

      expect(result).toHaveProperty("whereClause");
      expect(result).toHaveProperty("params");
    });

    it("should embed the raw tsvector expression as-is", () => {
      const expr = "coalesce(CASE WHEN type = 'A' THEN col1 ELSE col2 END, '')";
      const result = buildFTSWhereRaw(expr, "term");

      expect(result.whereClause).toContain(expr);
    });

    it("should include the search term in params as ftsQ", () => {
      const result = buildFTSWhereRaw("some_expr", "my term");

      expect(result.params).toEqual({ ftsQ: "my term" });
    });

    it("should use ts_rank_cd and websearch_to_tsquery", () => {
      const result = buildFTSWhereRaw("some_expr", "test");

      expect(result.whereClause).toContain("ts_rank_cd(");
      expect(result.whereClause).toContain("websearch_to_tsquery('simple', :ftsQ)");
      expect(result.whereClause).toContain("> 0");
    });

    it("should produce the same where clause structure as buildFTSWhere for a single field", () => {
      const field = "actor.fullName";
      const searchTerm = "hello";

      const fromFields = buildFTSWhere([field], searchTerm);
      const rawExpr = `coalesce(${field}::text, '')`;
      const fromRaw = buildFTSWhereRaw(rawExpr, searchTerm);

      expect(fromFields.whereClause).toBe(fromRaw.whereClause);
      expect(fromFields.params).toEqual(fromRaw.params);
    });
  });

  describe("applyFTSWhere", () => {
    it("should call andWhere on the query builder with whereClause and params", () => {
      const mockAndWhere = vi.fn().mockReturnThis();
      const mockQb = {
        andWhere: mockAndWhere,
      } as any;

      const fields = ["actor.fullName", "actor.username"];
      const searchTerm = "bob";

      const result = applyFTSWhere(mockQb, fields, searchTerm);

      expect(mockAndWhere).toHaveBeenCalledTimes(1);
      expect(mockAndWhere).toHaveBeenCalledWith(
        expect.stringContaining("ts_rank_cd("),
        { ftsQ: searchTerm },
      );
      expect(result).toBe(mockQb);
    });

    it("should return the query builder instance", () => {
      const mockQb = {
        andWhere: vi.fn().mockReturnThis(),
      } as any;

      const result = applyFTSWhere(mockQb, ["col"], "term");

      expect(result).toBe(mockQb);
    });

    it("should pass correct params to andWhere", () => {
      const mockAndWhere = vi.fn().mockReturnThis();
      const mockQb = { andWhere: mockAndWhere } as any;

      applyFTSWhere(mockQb, ["entity.name"], "specific term");

      const [, params] = mockAndWhere.mock.calls[0];
      expect(params).toEqual({ ftsQ: "specific term" });
    });
  });

  describe("blockNoteTextExpr", () => {
    it("should return a string expression", () => {
      const result = blockNoteTextExpr('"actor"."excerpt"');

      expect(typeof result).toBe("string");
    });

    it("should include the provided column reference", () => {
      const column = '"actor"."excerpt"';
      const result = blockNoteTextExpr(column);

      expect(result).toContain(column);
    });

    it("should use jsonb_path_query with recursive text path", () => {
      const result = blockNoteTextExpr('"entity"."body"');

      expect(result).toContain("jsonb_path_query");
      expect(result).toContain("$.**.text");
    });

    it("should use string_agg to concatenate text values", () => {
      const result = blockNoteTextExpr('"entity"."body"');

      expect(result).toContain("string_agg");
    });

    it("should wrap result in coalesce to handle null", () => {
      const result = blockNoteTextExpr('"entity"."body"');

      expect(result).toContain("coalesce(");
    });

    it("should cast column to jsonb", () => {
      const column = '"article"."content"';
      const result = blockNoteTextExpr(column);

      expect(result).toContain("::jsonb");
    });

    it("should produce different expressions for different columns", () => {
      const expr1 = blockNoteTextExpr('"actor"."excerpt"');
      const expr2 = blockNoteTextExpr('"actor"."body"');

      expect(expr1).not.toBe(expr2);
      expect(expr1).toContain('"actor"."excerpt"');
      expect(expr2).toContain('"actor"."body"');
    });
  });
});
