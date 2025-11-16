import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import type { Request, Response, NextFunction } from "express";

/**
 * Standard header name for correlation ID
 */
export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Generate a new correlation ID (UUID v4)
 */
export const generateCorrelationId = (): string => {
  return uuid();
};

/**
 * Extract correlation ID from request headers
 * Returns undefined if not present
 */
export const getCorrelationId = (req: Request): string | undefined => {
  const header = req.headers[CORRELATION_ID_HEADER];
  return Array.isArray(header) ? header[0] : header;
};

/**
 * Express middleware to attach or generate correlation IDs
 * If the request already has a correlation ID, it will be preserved
 * If not, a new one will be generated and attached to both request and response
 */
export const correlationMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if correlation ID already exists
    let correlationId = getCorrelationId(req);

    // Generate new ID if not present
    if (!correlationId) {
      correlationId = generateCorrelationId();
      req.headers[CORRELATION_ID_HEADER] = correlationId;
    }

    // Add correlation ID to response headers for tracing
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  };
};

/**
 * Helper to add correlation ID to axios requests
 * Use this when making HTTP calls from server to preserve trace
 */
export const withCorrelationId = (
  headers: Record<string, string>,
  correlationId: string,
): Record<string, string> => {
  return {
    ...headers,
    [CORRELATION_ID_HEADER]: correlationId,
  };
};
