import { IOError } from "@ts-endpoint/core";
import { describe, expect, it } from "vitest";
import { RedisError, toRedisError } from "../redis.error.js";

describe("redis.error", () => {
  describe("RedisError", () => {
    it("should have name RedisError", () => {
      const error = new RedisError("Test error", {
        kind: "ServerError",
        status: "500",
      });

      expect(error.name).toBe("RedisError");
    });

    it("should have the correct message", () => {
      const error = new RedisError("Connection refused", {
        kind: "ServerError",
        status: "500",
      });

      expect(error.message).toBe("Connection refused");
    });
  });

  describe("toRedisError", () => {
    it("should return IOError as RedisError if already an IOError", () => {
      const ioError = new IOError("Already an IOError", {
        kind: "ClientError",
        status: "400",
      });

      const result = toRedisError(ioError);
      expect(result).toBe(ioError);
    });

    it("should convert Error to RedisError with message and meta", () => {
      const error = new Error("Redis connection failed");

      const result = toRedisError(error);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.name).toBe("RedisError");
      expect(result.message).toBe("Redis connection failed");
    });

    it("should handle non-Error values by stringifying", () => {
      const unknownValue = "Connection refused";

      const result = toRedisError(unknownValue);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle null value", () => {
      const result = toRedisError(null);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle undefined value", () => {
      const result = toRedisError(undefined);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle number value", () => {
      const result = toRedisError(12345);

      expect(result).toBeInstanceOf(RedisError);
      expect(result.message).toBe("An error occurred");
    });
  });
});
