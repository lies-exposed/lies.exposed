import type * as logger from "@liexp/core/lib/logger/index.js";
import type { Request, Response } from "express";
import rateLimit, {
  ipKeyGenerator,
  type RateLimitRequestHandler,
} from "express-rate-limit";

export interface RateLimitConfig {
  logger: logger.Logger;
  /**
   * Window duration in milliseconds (default: 60000 = 1 minute)
   */
  windowMs?: number;
  /**
   * Maximum requests per window (default: 100)
   */
  maxRequests?: number;
  /**
   * Optional function to extract user key from request
   * Used to apply rate limiting per-user
   * If not provided, uses IP address
   */
  getUserKey?: (req: Request) => string | undefined;
  /**
   * Skip rate limiting for certain requests
   * Useful for health checks, internal endpoints
   */
  skip?: (req: Request) => boolean;
}

/**
 * Create a rate limiter middleware with consistent configuration
 * Applies per-user or per-IP rate limiting
 */
export const makeRateLimiter = (
  config: RateLimitConfig,
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: config.windowMs ?? 60000, // 1 minute default
    max: config.maxRequests ?? 100, // 100 requests per window default
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers

    // Key generator for rate limiting
    keyGenerator: (req: Request): string => {
      // Try user-specific key first
      const userKey = config.getUserKey?.(req);
      if (userKey) {
        return `user:${userKey}`;
      }

      // Fallback to IP address
      const forwardedFor = req.headers["x-forwarded-for"];
      const forwardedIp = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor;
      const ip = req.ip ?? forwardedIp ?? req.socket.remoteAddress;
      if (!ip) {
        throw new Error("Unable to determine IP address for rate limiting");
      }
      return ipKeyGenerator(ip);
    },

    // Skip function
    skip: config.skip ?? (() => false),

    // Handler for rate limit exceeded
    handler: (req: Request, res: Response): void => {
      const userKey = config.getUserKey?.(req);
      config.logger.warn.log(
        "Rate limit exceeded: user=%s ip=%s path=%s",
        userKey ?? "unknown",
        req.ip,
        req.path,
      );

      res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: res.getHeader("RateLimit-Reset"),
      });
    },
  });
};
