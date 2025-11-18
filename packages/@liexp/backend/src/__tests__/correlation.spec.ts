import type { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CORRELATION_ID_HEADER,
  generateCorrelationId,
  getCorrelationId,
  correlationMiddleware,
  withCorrelationId,
} from "../utils/correlation.js";

describe("correlation utils", () => {
  describe("CORRELATION_ID_HEADER", () => {
    it("should be 'x-correlation-id'", () => {
      expect(CORRELATION_ID_HEADER).toBe("x-correlation-id");
    });
  });

  describe("generateCorrelationId", () => {
    it("should generate a UUID v4", () => {
      const id = generateCorrelationId();

      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique IDs", () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).not.toBe(id2);
    });
  });

  describe("getCorrelationId", () => {
    it("should extract correlation ID from request headers", () => {
      const mockRequest = {
        headers: {
          "x-correlation-id": "test-corr-123",
        },
      } as Partial<Request>;

      const id = getCorrelationId(mockRequest as Request);

      expect(id).toBe("test-corr-123");
    });

    it("should return undefined when header not present", () => {
      const mockRequest = { headers: {} } as Partial<Request>;

      const id = getCorrelationId(mockRequest as Request);

      expect(id).toBeUndefined();
    });

    it("should handle array header value (take first)", () => {
      const mockRequest = {
        headers: {
          "x-correlation-id": ["first-id", "second-id"],
        },
      } as Partial<Request>;

      const id = getCorrelationId(mockRequest as Request);

      expect(id).toBe("first-id");
    });
  });

  describe("correlationMiddleware", () => {
    let mockRequest: Partial<Request> & { correlationId?: string };
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockResponse = {
        setHeader: vi.fn(),
      };

      mockNext = vi.fn();
    });

    it("should generate correlation ID when not present", () => {
      const middleware = correlationMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const correlationId = mockRequest.correlationId;
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe("string");
      expect(correlationId).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it("should preserve existing correlation ID", () => {
      mockRequest.headers = {
        "x-correlation-id": "existing-id-456",
      };

      const middleware = correlationMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.headers["x-correlation-id"]).toBe("existing-id-456");
    });

    it("should set correlation ID in response headers", () => {
      const middleware = correlationMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "x-correlation-id",
        expect.any(String),
      );
    });

    it("should call next middleware", () => {
      const middleware = correlationMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should use same ID for request and response", () => {
      const middleware = correlationMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const requestId = mockRequest.correlationId;
      const responseId = (mockResponse.setHeader as any).mock.calls[0][1];

      expect(requestId).toBe(responseId);
    });
  });

  describe("withCorrelationId", () => {
    it("should add correlation ID to headers object", () => {
      const headers = {
        "Content-Type": "application/json",
      };

      const result = withCorrelationId(headers, "corr-789");

      expect(result).toEqual({
        "Content-Type": "application/json",
        "x-correlation-id": "corr-789",
      });
    });

    it("should not mutate original headers", () => {
      const headers = {
        "Content-Type": "application/json",
      };

      const result = withCorrelationId(headers, "corr-789");

      expect(headers).toEqual({
        "Content-Type": "application/json",
      });
      expect(result).not.toBe(headers);
    });

    it("should work with empty headers object", () => {
      const result = withCorrelationId({}, "corr-123");

      expect(result).toEqual({
        "x-correlation-id": "corr-123",
      });
    });

    it("should override existing correlation ID", () => {
      const headers = {
        "x-correlation-id": "old-id",
      };

      const result = withCorrelationId(headers, "new-id");

      expect(result["x-correlation-id"]).toBe("new-id");
    });
  });
});
