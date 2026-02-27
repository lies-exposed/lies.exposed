import type { RequestHandler } from "express";
import type { RedisClient } from "../../providers/redis/redis.provider.js";

export interface CacheMiddlewareConfig {
  /** Cache TTL in seconds */
  ttl: number;
  /** Redis key prefix, e.g. "cache:actors" */
  keyPrefix: string;
  /**
   * Redis key glob patterns to scan and delete when a mutating request
   * (POST / PUT / PATCH / DELETE) completes with a 2xx status code.
   * Defaults to [`${keyPrefix}:*`].
   */
  invalidationPatterns?: string[];
}

const buildKey = (prefix: string, url: string): string => `${prefix}:${url}`;

/**
 * Express middleware that caches GET responses in Redis and adds
 * Cache-Control headers.  Non-GET requests trigger cache invalidation
 * (via key-pattern scan + delete) after a successful 2xx response.
 *
 * Usage:
 * ```ts
 * router.use("/actors", makeCacheMiddleware(ctx.redis, {
 *   ttl: 3600,
 *   keyPrefix: "cache:actors",
 * }));
 * ```
 */
export const makeCacheMiddleware = (
  redis: RedisClient,
  config: CacheMiddlewareConfig,
): RequestHandler => {
  const { ttl, keyPrefix, invalidationPatterns = [`${keyPrefix}:*`] } = config;

  return (req, res, next) => {
    // ── Authenticated requests bypass cache entirely ───────────────────────
    if (req.headers.authorization) {
      res.setHeader("Cache-Control", "no-store");
      return next();
    }

    // ── Mutations: invalidate matching keys after a 2xx response ──────────
    if (req.method !== "GET") {
      if (invalidationPatterns.length > 0) {
        res.on("finish", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            Promise.all(
              invalidationPatterns.map(async (pattern) => {
                const keys = await redis.client.keys(pattern);
                if (keys.length > 0) {
                  await redis.client.del(keys);
                }
              }),
            ).catch(() => {
              // Intentionally swallowed: cache invalidation errors must
              // not affect the response that was already sent.
            });
          }
        });
      }
      return next();
    }

    // ── GET: try to serve from cache ──────────────────────────────────────
    const cacheKey = buildKey(keyPrefix, req.originalUrl);

    // Wrap in Promise.resolve().then() so that a synchronous throw from
    // redis.client.get() (e.g. when the client is a test mock that returns
    // undefined instead of a Promise) is converted into a rejection that
    // the .catch() below can handle gracefully.
    Promise.resolve()
      .then(() => redis.client.get(cacheKey))
      .then((cached) => {
        if (cached != null) {
          res.setHeader("X-Cache", "HIT");
          res.setHeader("Cache-Control", `public, max-age=${ttl}`);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(cached);
          return;
        }

        // Cache miss – intercept res.json so we can store the result
        res.setHeader("X-Cache", "MISS");
        res.setHeader("Cache-Control", `public, max-age=${ttl}`);

        const originalJson = res.json.bind(res);
        res.json = function cacheInterceptor(body) {
          if (res.statusCode === 200) {
            Promise.resolve()
              .then(() =>
                redis.client.setex(cacheKey, ttl, JSON.stringify(body)),
              )
              .catch(() => {});
          }
          return originalJson(body);
        } as typeof res.json;

        next();
      })
      .catch(() => {
        // Redis unavailable – pass through without caching
        next();
      });
  };
};
