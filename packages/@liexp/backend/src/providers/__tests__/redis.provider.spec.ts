import { fp } from "@liexp/core/lib/fp/index.js";
import type { Redis } from "ioredis";
import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { GetRedisClient, type RedisClient } from "../redis/redis.provider.js";

describe("redis.provider", () => {
  const _mockLogger = {
    debug: { log: vi.fn() },
    error: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
  };

  describe("GetRedisClient", () => {
    it("should return Right with RedisClient when connection succeeds", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: true,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        expect(result.right.client).toBe(mockRedis);
        expect(typeof result.right.get).toBe("function");
        expect(typeof result.right.set).toBe("function");
      }
    });

    it("should return Right without calling connect when connect is false", async () => {
      const mockRedis = mockDeep<Redis>();

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      expect(mockRedis.connect).not.toHaveBeenCalled();
    });

    it("should return Left when redis get fails", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.get.mockImplementation(() =>
        Promise.reject(new Error("Redis get failed")),
      );

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const getResult = await result.right.get("test-key")();
        expect(fp.E.isLeft(getResult)).toBe(true);
      }
    });

    it("should return Left when redis set fails", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.set.mockImplementation(() =>
        Promise.reject(new Error("Redis set failed")),
      );

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const setResult = await result.right.set("test-key", "test-value")();
        expect(fp.E.isLeft(setResult)).toBe(true);
      }
    });

    it("should successfully get a value", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.get.mockResolvedValue("test-value");

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const getResult = await result.right.get("test-key")();
        expect(fp.E.isRight(getResult)).toBe(true);
        if (fp.E.isRight(getResult)) {
          expect(getResult.right).toBe("test-value");
        }
      }
    });

    it("should successfully set a value", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.set.mockResolvedValue("OK");

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const setResult = await result.right.set("test-key", "test-value")();
        expect(fp.E.isRight(setResult)).toBe(true);
        if (fp.E.isRight(setResult)) {
          expect(setResult.right).toBe("OK");
        }
      }
    });

    it("should return null when key does not exist", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.get.mockResolvedValue(null);

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const getResult = await result.right.get("nonexistent-key")();
        expect(fp.E.isRight(getResult)).toBe(true);
        if (fp.E.isRight(getResult)) {
          expect(getResult.right).toBeNull();
        }
      }
    });
  });

  describe("RedisClient interface", () => {
    it("should have get and set methods", async () => {
      const mockRedis = mockDeep<Redis>();
      mockRedis.connect.mockResolvedValue(undefined);
      mockRedis.get.mockResolvedValue("value");
      mockRedis.set.mockResolvedValue("OK");

      const result = await GetRedisClient({
        client: () => mockRedis as Redis,
        connect: false,
      })();

      expect(fp.E.isRight(result)).toBe(true);
      if (fp.E.isRight(result)) {
        const client: RedisClient = result.right;
        expect(typeof client.get).toBe("function");
        expect(typeof client.set).toBe("function");
      }
    });
  });
});
