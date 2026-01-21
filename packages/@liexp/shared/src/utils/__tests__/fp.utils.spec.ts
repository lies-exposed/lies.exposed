import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, expect, it } from "vitest";
import { traverseArrayOfE, throwTE, throwRTE } from "../fp.utils.js";

describe("fp.utils", () => {
  describe("traverseArrayOfE", () => {
    it("should traverse an array and return Right when all succeed", () => {
      const items = [1, 2, 3, 4, 5];
      const fn = (n: number): E.Either<string, number> => E.right(n * 2);

      const result = traverseArrayOfE(items, fn);
      expect(result).toEqual(E.right([2, 4, 6, 8, 10]));
    });

    it("should return Left when any item fails", () => {
      const items = [1, 2, 3, 4, 5];
      const fn = (n: number): E.Either<string, number> =>
        n === 3 ? E.left("error at 3") : E.right(n * 2);

      const result = traverseArrayOfE(items, fn);
      expect(result).toEqual(E.left("error at 3"));
    });

    it("should handle empty arrays", () => {
      const items: number[] = [];
      const fn = (n: number): E.Either<string, number> => E.right(n * 2);

      const result = traverseArrayOfE(items, fn);
      expect(result).toEqual(E.right([]));
    });

    it("should return the first error encountered", () => {
      const items = [1, 2, 3, 4, 5];
      const fn = (n: number): E.Either<string, number> =>
        n > 1 ? E.left(`error at ${n}`) : E.right(n * 2);

      const result = traverseArrayOfE(items, fn);
      expect(result).toEqual(E.left("error at 2"));
    });
  });

  describe("throwTE", () => {
    it("should resolve with the right value on success", async () => {
      const te = TE.right(42);
      const result = await throwTE(te);
      expect(result).toBe(42);
    });

    it("should reject with the left value on failure", async () => {
      const te = TE.left("error");
      await expect(throwTE(te)).rejects.toBe("error");
    });

    it("should handle complex right values", async () => {
      const te = TE.right({ foo: "bar", count: 123 });
      const result = await throwTE(te);
      expect(result).toEqual({ foo: "bar", count: 123 });
    });

    it("should handle complex error objects", async () => {
      const error = new Error("Something went wrong");
      const te = TE.left(error);
      await expect(throwTE(te)).rejects.toBe(error);
    });
  });

  describe("throwRTE", () => {
    it("should resolve with the right value on success", async () => {
      const rte = () => TE.right(42);
      const result = await throwRTE({})(rte);
      expect(result).toBe(42);
    });

    it("should reject with the left value on failure", async () => {
      const rte = () => TE.left("error");
      await expect(throwRTE({})(rte)).rejects.toBe("error");
    });

    it("should pass context to the ReaderTaskEither", async () => {
      interface Context {
        multiplier: number;
      }
      const rte = (ctx: Context) => TE.right(5 * ctx.multiplier);
      const result = await throwRTE({ multiplier: 10 })(rte);
      expect(result).toBe(50);
    });

    it("should handle context-dependent errors", async () => {
      interface Context {
        shouldFail: boolean;
      }
      const rte = (ctx: Context) =>
        ctx.shouldFail ? TE.left("failed by context") : TE.right("success");

      await expect(throwRTE({ shouldFail: true })(rte)).rejects.toBe(
        "failed by context",
      );
      const result = await throwRTE({ shouldFail: false })(rte);
      expect(result).toBe("success");
    });
  });
});
