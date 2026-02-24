import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeCacheMiddleware } from "../express/middleware/cache.middleware.js";
import type { RedisClient } from "../providers/redis/redis.provider.js";

// ── helpers ──────────────────────────────────────────────────────────────────

const makeRedisMock = (
  overrides: Partial<{
    get: (key: string) => Promise<string | null>;
    setex: (key: string, ttl: number, value: string) => Promise<"OK">;
    keys: (pattern: string) => Promise<string[]>;
    del: (...keys: string[]) => Promise<number>;
  }> = {},
): RedisClient => {
  const client = {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue("OK"),
    keys: vi.fn().mockResolvedValue([]),
    del: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
  return {
    client: client as any,
    get: vi.fn(),
    set: vi.fn(),
  };
};

const makeResMock = (): Response => {
  const res: Partial<Response> = {
    statusCode: 200,
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    on: vi.fn(),
  };
  // Allow status() to mutate statusCode
  (res.status as ReturnType<typeof vi.fn>).mockImplementation(
    (code: number) => {
      res.statusCode = code;
      return res;
    },
  );
  return res as Response;
};

const makeReqMock = (
  method = "GET",
  url = "/actors?page=1",
): Partial<Request> => ({
  method,
  originalUrl: url,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("makeCacheMiddleware", () => {
  const config = { ttl: 60, keyPrefix: "cache:test" };
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    next = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── GET / cache miss ───────────────────────────────────────────────────────

  describe("GET – cache miss", () => {
    it("calls next() and sets MISS header when Redis returns null", async () => {
      const redis = makeRedisMock({ get: vi.fn().mockResolvedValue(null) });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();
      const req = makeReqMock("GET", "/actors?page=1");

      middleware(req as Request, res, next);

      await vi.waitUntil(() => next.mock.calls.length > 0);

      expect(next).toHaveBeenCalledOnce();
      expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        `public, max-age=${config.ttl}`,
      );
    });

    it("stores the response body in Redis via the res.json interceptor", async () => {
      const setex = vi.fn().mockResolvedValue("OK");
      const redis = makeRedisMock({ get: vi.fn().mockResolvedValue(null), setex });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();
      const req = makeReqMock("GET", "/actors?page=1");

      middleware(req as Request, res, next);
      await vi.waitUntil(() => next.mock.calls.length > 0);

      // Simulate the route handler calling res.json
      const body = { data: [{ id: "1" }], total: 1 };
      (res as any).json(body);

      await vi.waitUntil(() => setex.mock.calls.length > 0);

      expect(setex).toHaveBeenCalledWith(
        `cache:test:/actors?page=1`,
        config.ttl,
        JSON.stringify(body),
      );
    });

    it("uses the full originalUrl (path + query string) as part of the cache key", async () => {
      const get = vi.fn().mockResolvedValue(null);
      const redis = makeRedisMock({ get });
      const middleware = makeCacheMiddleware(redis, config);

      const urls = [
        "/actors",
        "/actors?page=2",
        "/actors?page=1&limit=5",
        "/actors/some-uuid",
      ];

      for (const url of urls) {
        const res = makeResMock();
        middleware(makeReqMock("GET", url) as Request, res, vi.fn());
      }

      await vi.waitUntil(() => get.mock.calls.length >= urls.length);

      const calledKeys = get.mock.calls.map(([k]) => k);
      expect(calledKeys).toEqual(
        urls.map((u) => `cache:test:${u}`),
      );
    });
  });

  // ── GET / cache hit ────────────────────────────────────────────────────────

  describe("GET – cache hit", () => {
    it("responds with cached JSON and sets HIT header, skips next()", async () => {
      const cached = JSON.stringify({ data: [{ id: "42" }] });
      const redis = makeRedisMock({ get: vi.fn().mockResolvedValue(cached) });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock() as Request, res, next);

      await vi.waitUntil(() => (res.send as ReturnType<typeof vi.fn>).mock.calls.length > 0);

      expect(next).not.toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "HIT");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        `public, max-age=${config.ttl}`,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(cached);
    });
  });

  // ── GET / Redis unavailable ────────────────────────────────────────────────

  describe("GET – Redis unavailable", () => {
    it("calls next() and does not crash when get() rejects", async () => {
      const redis = makeRedisMock({
        get: vi.fn().mockRejectedValue(new Error("connection refused")),
      });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock() as Request, res, next);

      await vi.waitUntil(() => next.mock.calls.length > 0);

      expect(next).toHaveBeenCalledOnce();
    });

    it("calls next() and does not crash when get() returns undefined (test mock)", async () => {
      // Simulates vitest-mock-extended behaviour where methods return undefined
      const redis = makeRedisMock({ get: vi.fn().mockReturnValue(undefined) });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock() as Request, res, next);

      await vi.waitUntil(() => next.mock.calls.length > 0);

      expect(next).toHaveBeenCalledOnce();
    });

    it("does not crash when setex() returns undefined (test mock)", async () => {
      const redis = makeRedisMock({
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockReturnValue(undefined) as any,
      });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock() as Request, res, next);
      await vi.waitUntil(() => next.mock.calls.length > 0);

      // Should not throw when res.json is called
      expect(() => (res as any).json({ data: [] })).not.toThrow();
    });
  });

  // ── Mutations / cache invalidation ────────────────────────────────────────

  describe("mutations – cache invalidation", () => {
    it("calls next() immediately for POST requests", () => {
      const redis = makeRedisMock();
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock("POST") as Request, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(redis.client.get).not.toHaveBeenCalled();
    });

    it("invalidates matching Redis keys after a successful POST", async () => {
      const matchingKeys = ["cache:test:/actors", "cache:test:/actors?page=1"];
      const keys = vi.fn().mockResolvedValue(matchingKeys);
      const del = vi.fn().mockResolvedValue(2);
      const redis = makeRedisMock({ keys, del });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      // Register the finish listener
      const finishListeners: Array<() => void> = [];
      (res.on as ReturnType<typeof vi.fn>).mockImplementation(
        (event: string, cb: () => void) => {
          if (event === "finish") finishListeners.push(cb);
        },
      );

      middleware(makeReqMock("POST") as Request, res, next);

      // Simulate response finishing with 201
      res.statusCode = 201;
      for (const fn of finishListeners) fn();

      await vi.waitUntil(() => del.mock.calls.length > 0);

      expect(keys).toHaveBeenCalledWith("cache:test:*");
      expect(del).toHaveBeenCalledWith(matchingKeys);
    });

    it("does NOT invalidate when the mutation returns a non-2xx status", async () => {
      const keys = vi.fn().mockResolvedValue(["cache:test:/actors"]);
      const del = vi.fn();
      const redis = makeRedisMock({ keys, del });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      const finishListeners: Array<() => void> = [];
      (res.on as ReturnType<typeof vi.fn>).mockImplementation(
        (event: string, cb: () => void) => {
          if (event === "finish") finishListeners.push(cb);
        },
      );

      middleware(makeReqMock("POST") as Request, res, next);

      res.statusCode = 422;
      for (const fn of finishListeners) fn();

      // Give any async work a chance to run
      await new Promise((r) => setTimeout(r, 10));

      expect(del).not.toHaveBeenCalled();
    });

    it("supports custom invalidation patterns", async () => {
      const keys = vi.fn().mockResolvedValue(["cache:events:/events"]);
      const del = vi.fn().mockResolvedValue(1);
      const redis = makeRedisMock({ keys, del });
      const middleware = makeCacheMiddleware(redis, {
        ...config,
        invalidationPatterns: ["cache:events:*", "cache:graphs:*"],
      });
      const res = makeResMock();

      const finishListeners: Array<() => void> = [];
      (res.on as ReturnType<typeof vi.fn>).mockImplementation(
        (event: string, cb: () => void) => {
          if (event === "finish") finishListeners.push(cb);
        },
      );

      middleware(makeReqMock("DELETE") as Request, res, next);

      res.statusCode = 200;
      for (const fn of finishListeners) fn();

      await vi.waitUntil(() => keys.mock.calls.length >= 2);

      expect(keys).toHaveBeenCalledWith("cache:events:*");
      expect(keys).toHaveBeenCalledWith("cache:graphs:*");
    });
  });

  // ── res.json interceptor / non-200 ────────────────────────────────────────

  describe("res.json interceptor", () => {
    it("does NOT cache when the handler responds with a non-200 status", async () => {
      const setex = vi.fn().mockResolvedValue("OK");
      const redis = makeRedisMock({ get: vi.fn().mockResolvedValue(null), setex });
      const middleware = makeCacheMiddleware(redis, config);
      const res = makeResMock();

      middleware(makeReqMock() as Request, res, next);
      await vi.waitUntil(() => next.mock.calls.length > 0);

      res.statusCode = 404;
      (res as any).json({ error: "not found" });

      await new Promise((r) => setTimeout(r, 10));

      expect(setex).not.toHaveBeenCalled();
    });
  });
});
