import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { ENVParser } from "../env.utils.js";

describe("env.utils", () => {
  describe("ENVParser", () => {
    it("should decode a valid environment value", () => {
      const parser = ENVParser<string>((u) =>
        typeof u === "string" ? E.right(u) : E.left([] as ParseError),
      );

      const result = parser("hello");
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("hello");
      }
    });

    it("should return a DecodeError when decoding fails", () => {
      const parser = ENVParser<number>((u) =>
        typeof u === "number" ? E.right(u) : E.left([] as ParseError),
      );

      const result = parser("not-a-number");
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Failed to decode process env");
      }
    });

    it("should wrap decode errors with a descriptive message", () => {
      const parser = ENVParser<boolean>((u) =>
        typeof u === "boolean" ? E.right(u) : E.left([] as ParseError),
      );

      const result = parser(123);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toContain("Failed to decode process env");
      }
    });

    it("should handle null values", () => {
      const parser = ENVParser<string>((u) =>
        u !== null && u !== undefined
          ? E.right(String(u as string))
          : E.left([] as ParseError),
      );

      const result = parser(null);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should handle undefined values", () => {
      const parser = ENVParser<string>((u) =>
        u !== null && u !== undefined
          ? E.right(String(u as string))
          : E.left([] as ParseError),
      );

      const result = parser(undefined);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should pass through successful decoding with correct type", () => {
      const parser = ENVParser<{ port: number }>((u) => {
        if (typeof u === "object" && u !== null && "port" in u) {
          return E.right({ port: (u as { port: number }).port });
        }
        return E.left([] as ParseError);
      });

      const result = parser({ port: 3000 });
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.port).toBe(3000);
      }
    });

    it("should return DecodeError with the parse error attached", () => {
      const parser = ENVParser<string>((u) =>
        typeof u === "string" ? E.right(u) : E.left([] as ParseError),
      );

      const result = parser(42);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DecodeError);
      }
    });
  });
});
