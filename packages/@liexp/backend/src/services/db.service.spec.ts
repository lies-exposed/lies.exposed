import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../context/db.context.js";
import { type ENVContext } from "../context/env.context.js";
import { mockedContext } from "../test/context.js";
import { mockTERightOnce } from "../test/mocks/mock.utils.js";
import { DBService } from "./db.service.js";

type DBServiceTestContext = DatabaseContext & ENVContext;

describe("DBService", () => {
  const appTest = {
    ctx: {
      ...mockedContext<DBServiceTestContext>({ db: mock() }),
      env: { DEFAULT_PAGE_SIZE: 20 } as any,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ //
  // execQuery
  // ------------------------------------------------------------------ //

  describe("execQuery", () => {
    it("should delegate to ctx.db.execQuery and return the result", async () => {
      const expectedValue = { id: "abc", name: "test" };
      const queryFn = vi.fn().mockResolvedValue(expectedValue);

      mockTERightOnce(appTest.ctx.db.execQuery, () => expectedValue);

      const result = await pipe(
        DBService.execQuery<typeof expectedValue, DBServiceTestContext>(
          queryFn,
        )(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.db.execQuery).toHaveBeenCalledWith(queryFn);
      expect(result).toEqual(expectedValue);
    });

    it("should return a Left when ctx.db.execQuery fails", async () => {
      const dbError = { name: "DBError", message: "query failed" };

      appTest.ctx.db.execQuery.mockImplementationOnce(() =>
        fp.TE.left(dbError as any),
      );

      const te = DBService.execQuery<unknown, DBServiceTestContext>(
        vi.fn(),
      )(appTest.ctx);
      const outcome = await te();

      expect(outcome._tag).toBe("Left");
      expect((outcome as any).left).toEqual(dbError);
    });

    it("should call ctx.db.execQuery with the provided function", async () => {
      const fn = vi.fn(async () => [1, 2, 3]);

      mockTERightOnce(appTest.ctx.db.execQuery, () => [1, 2, 3]);

      await pipe(
        DBService.execQuery<number[], DBServiceTestContext>(fn)(appTest.ctx),
        throwTE,
      );

      expect(appTest.ctx.db.execQuery).toHaveBeenCalledWith(fn);
    });
  });

  // ------------------------------------------------------------------ //
  // getORMOptions
  // ------------------------------------------------------------------ //

  describe("getORMOptions", () => {
    it("should use the provided pageSize when given explicitly", () => {
      const opts = {
        _start: O.some(0),
        _end: O.some(5),
        _sort: O.none as O.Option<string>,
        _order: O.none as O.Option<any>,
      };

      const ormOptions = DBService.getORMOptions(opts, 10)(appTest.ctx);

      // take should come from _end (5), capped by _end
      expect(ormOptions.take).toBe(5);
      expect(ormOptions.skip).toBe(0);
    });

    it("should fall back to ctx.env.DEFAULT_PAGE_SIZE when pageSize is not given", () => {
      const opts = {
        _start: O.some(0),
        _end: O.none as O.Option<number>,
        _sort: O.none as O.Option<string>,
        _order: O.none as O.Option<any>,
      };

      const ormOptions = DBService.getORMOptions(opts)(appTest.ctx);

      expect(ormOptions.take).toBe(appTest.ctx.env.DEFAULT_PAGE_SIZE);
      expect(ormOptions.skip).toBe(0);
    });

    it("should apply sort and order when provided", () => {
      const opts = {
        _start: O.some(0),
        _end: O.some(10),
        _sort: O.some("createdAt"),
        _order: O.some("ASC" as const),
      };

      const ormOptions = DBService.getORMOptions(opts, 10)(appTest.ctx);

      expect(ormOptions.order).toEqual({ createdAt: "ASC" });
    });

    it("should apply skip when _start is greater than 0", () => {
      const opts = {
        _start: O.some(20),
        _end: O.some(30),
        _sort: O.none as O.Option<string>,
        _order: O.none as O.Option<any>,
      };

      const ormOptions = DBService.getORMOptions(opts, 50)(appTest.ctx);

      expect(ormOptions.skip).toBe(20);
      expect(ormOptions.take).toBe(30);
    });

    it("should produce empty order when _sort is none", () => {
      const opts = {
        _start: O.none as O.Option<number>,
        _end: O.none as O.Option<number>,
        _sort: O.none as O.Option<string>,
        _order: O.none as O.Option<any>,
      };

      const ormOptions = DBService.getORMOptions(opts, 20)(appTest.ctx);

      expect(ormOptions.order).toBeUndefined();
    });
  });
});
