import * as O from "fp-ts/lib/Option.js";
import { describe, expect, it } from "vitest";
import { getORMOptions } from "./orm.utils.js";

describe("orm.utils", () => {
  describe("getORMOptions", () => {
    it("should return default skip and take when no pagination provided", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.none,
          _sort: O.none,
          _order: O.none,
        },
        25,
      );
      expect(opts.skip).toBe(0);
      expect(opts.take).toBe(25);
    });

    it("should use provided _start and _end for pagination", () => {
      const opts = getORMOptions(
        {
          _start: O.some(10),
          _end: O.some(20),
          _sort: O.none,
          _order: O.none,
        },
        25,
      );
      expect(opts.skip).toBe(10);
      expect(opts.take).toBe(20);
    });

    it("should use defaultPageSize when _end is 0", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.some(0),
          _sort: O.none,
          _order: O.none,
        },
        100,
      );
      expect(opts.take).toBe(100);
    });

    it("should produce order when _sort is provided", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.none,
          _sort: O.some("createdAt"),
          _order: O.some("DESC" as const),
        },
        25,
      );
      expect(opts.order).toBeDefined();
      expect(opts.order?.["createdAt"]).toBe("DESC");
    });

    it("should use DESC order by default when _sort present but _order absent", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.none,
          _sort: O.some("updatedAt"),
          _order: O.none,
        },
        25,
      );
      expect(opts.order?.["updatedAt"]).toBe("DESC");
    });

    it("should produce empty order when _sort is none", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.none,
          _sort: O.none,
          _order: O.none,
        },
        25,
      );
      expect(opts.order).toBeUndefined();
    });

    it("should not include where when no filters provided", () => {
      const opts = getORMOptions(
        {
          _start: O.none,
          _end: O.none,
          _sort: O.none,
          _order: O.none,
        },
        25,
      );
      expect(opts.where).toBeUndefined();
    });
  });
});
