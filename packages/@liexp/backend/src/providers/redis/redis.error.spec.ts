import { IOError } from "@ts-endpoint/core";
import { describe, it, expect } from "vitest";
import { RedisError, toRedisError } from "./redis.error.js";

describe("redis.error", () => {
  describe("RedisError", () => {
    it("should be an instance of IOError", () => {
      const error = new RedisError("test error", {
        kind: "ServerError",
        status: "500",
        meta: ["detail"],
      });

      expect(error).toBeInstanceOf(IOError);
    });

    it("should have name set to 'RedisError'", () => {
      const error = new RedisError("test error", {
        kind: "ServerError",
        status: "500",
        meta: [],
      });

      expect(error.name).toBe("RedisError");
    });

    it("should preserve the message", () => {
      const message = "connection refused";
      const error = new RedisError(message, {
        kind: "ServerError",
        status: "500",
        meta: [],
      });

      expect(error.message).toBe(message);
    });

    it("should store details", () => {
      const details = { kind: "ServerError" as const, status: "500" as const, meta: ["ECONNREFUSED"] };
      const error = new RedisError("fail", details);

      expect(error.details).toMatchObject({ kind: "ServerError", status: "500" });
    });
  });

  describe("toRedisError", () => {
    it("should return the same IOError instance if input is already an IOError", () => {
      const ioError = new IOError("io error", {
        kind: "ServerError",
        status: "500",
        meta: [],
      });

      const result = toRedisError(ioError);

      expect(result).toBe(ioError);
    });

    it("should return the same RedisError instance if input is already a RedisError", () => {
      const redisError = new RedisError("redis fail", {
        kind: "ServerError",
        status: "500",
        meta: [],
      });

      const result = toRedisError(redisError);

      expect(result).toBe(redisError);
    });

    it("should wrap a plain Error into a RedisError", () => {
      const error = new Error("something went wrong");
      error.stack = "Error: something went wrong\n  at test.ts:1:1";

      const result = toRedisError(error);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("something went wrong");
    });

    it("should include error name and stack in meta when wrapping a plain Error", () => {
      const error = new TypeError("type mismatch");

      const result = toRedisError(error);

      expect(result.details.meta).toContain("TypeError");
    });

    it("should use kind ServerError and status 500 when wrapping a plain Error", () => {
      const error = new Error("fail");

      const result = toRedisError(error);

      expect(result.details.kind).toBe("ServerError");
      expect(result.details.status).toBe("500");
    });

    it("should wrap a string value into a RedisError with 'An error occurred' message", () => {
      const result = toRedisError("something string");

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should include the stringified value in meta when wrapping a non-Error unknown", () => {
      const result = toRedisError(42);

      expect(result.details.meta).toContain("42");
    });

    it("should wrap a plain object into a RedisError", () => {
      const obj = { code: "ECONNREFUSED" };

      const result = toRedisError(obj);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should wrap null into a RedisError", () => {
      const result = toRedisError(null);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should return a RedisError with name 'RedisError' in all branches", () => {
      const fromError = toRedisError(new Error("e"));
      const fromString = toRedisError("str");
      const fromNumber = toRedisError(0);

      expect(fromError.name).toBe("RedisError");
      expect(fromString.name).toBe("RedisError");
      expect(fromNumber.name).toBe("RedisError");
    });
  });
});
