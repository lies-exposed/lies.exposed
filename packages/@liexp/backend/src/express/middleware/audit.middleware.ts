import type * as logger from "@liexp/core/lib/logger/index.js";
import type { Request, Response, NextFunction } from "express";

export interface AuditConfig {
  logger: logger.Logger;
  /**
   * Optional function to extract user context from request
   * Useful for logging authenticated user details
   */
  getUserContext?: (req: Request) => Record<string, any> | undefined;
}

/**
 * Express middleware for audit logging of incoming requests
 * Logs method, path, user context, correlation ID, and timing
 */
export const makeAuditMiddleware = (config: AuditConfig) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const correlationId = req.headers["x-correlation-id"] as string | undefined;
    const userContext = config.getUserContext?.(req);

    // Log incoming request
    config.logger.info.log(
      "Incoming request: method=%s path=%s correlation_id=%s user=%O",
      req.method,
      req.path,
      correlationId ?? "none",
      userContext ?? "anonymous",
    );

    // Capture response finish event to log timing
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      config.logger.info.log(
        "Request completed: method=%s path=%s status=%d duration=%dms correlation_id=%s",
        req.method,
        req.path,
        res.statusCode,
        duration,
        correlationId ?? "none",
      );
    });

    next();
  };
};
