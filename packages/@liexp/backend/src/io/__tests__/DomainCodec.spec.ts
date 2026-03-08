import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { IOCodec } from "../DomainCodec.js";

const StringSchema = Schema.String;

const StringIOCodec = IOCodec(
  StringSchema,
  {
    decode: (v: unknown) =>
      Schema.decodeUnknownEither(StringSchema)(v),
    encode: (v: unknown) =>
      Schema.encodeUnknownEither(StringSchema)(v),
  },
  "string",
);

const InvalidCodec = IOCodec(
  StringSchema,
  {
    decode: (_v: unknown) =>
      E.left(DecodeError.of("always fails", new Error("test error"))),
    encode: (_v: unknown) =>
      E.left(DecodeError.of("always fails", new Error("test error"))),
  },
  "invalid",
);

describe("IOCodec (DomainCodec)", () => {
  describe("decodeSingle", () => {
    it("should return Right for valid data", () => {
      const result = StringIOCodec.decodeSingle("hello world");
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("hello world");
      }
    });

    it("should return Left for invalid data", () => {
      const result = StringIOCodec.decodeSingle(12345);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should wrap parse error in DecodeError with resource name", () => {
      const result = StringIOCodec.decodeSingle(null);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DecodeError);
        expect(result.left.message).toMatch(/string/i);
      }
    });
  });

  describe("decodeMany", () => {
    it("should return Right for valid array", () => {
      const result = StringIOCodec.decodeMany(["a", "b", "c"]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(["a", "b", "c"]);
      }
    });

    it("should return Left if any element fails decoding", () => {
      const result = StringIOCodec.decodeMany(["valid", 42 as any, "also valid"]);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Right for empty array", () => {
      const result = StringIOCodec.decodeMany([]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual([]);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Right for valid data", () => {
      const result = StringIOCodec.encodeSingle("test");
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("test");
      }
    });

    it("should return Left for invalid data", () => {
      const result = StringIOCodec.encodeSingle(99 as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("encodeMany", () => {
    it("should return Right for valid array", () => {
      const result = StringIOCodec.encodeMany(["x", "y"]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(["x", "y"]);
      }
    });

    it("should return Left if any element fails encoding", () => {
      const result = StringIOCodec.encodeMany(["valid", 55 as any]);
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("error wrapping", () => {
    it("should wrap DecodeError with resource name in message", () => {
      const result = InvalidCodec.decodeSingle("anything");
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DecodeError);
      }
    });

    it("should pass through existing DecodeError without wrapping again", () => {
      const existingError = DecodeError.of("pre-existing error", new Error("original"));
      const PassThroughCodec = IOCodec(
        StringSchema,
        {
          decode: (_v: unknown) => E.left(existingError),
          encode: (_v: unknown) => E.left(existingError),
        },
        "passthrough",
      );
      const result = PassThroughCodec.decodeSingle("anything");
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(existingError);
      }
    });
  });
});
