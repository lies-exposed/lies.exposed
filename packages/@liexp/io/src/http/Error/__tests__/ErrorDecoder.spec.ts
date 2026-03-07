import * as E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { ErrorDecoder } from "../ErrorDecoder.js";

describe("ErrorDecoder", () => {
  describe("decode", () => {
    test("Should decode a TypeError", () => {
      const error = new TypeError("type error message");
      const result = ErrorDecoder.decode(error);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.name).toBe("TypeError");
        expect(result.right.message).toBe("type error message");
      }
    });

    test("Should decode a generic Error", () => {
      const error = new Error("generic error");
      const result = ErrorDecoder.decode(error);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.message).toBe("generic error");
      }
    });

    test("Should decode a CoreError-shaped object", () => {
      const coreError = {
        name: "SomeError",
        message: "some message",
        details: ["detail 1"],
      };
      const result = ErrorDecoder.decode(coreError);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.name).toBe("SomeError");
        expect(result.right.message).toBe("some message");
      }
    });

    test("Should fail to decode an unknown value", () => {
      const result = ErrorDecoder.decode(42);
      expect(E.isLeft(result)).toBe(true);
    });

    test("Should fail to decode null", () => {
      const result = ErrorDecoder.decode(null);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
