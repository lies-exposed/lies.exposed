import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  CORRELATION_ID_HEADER,
  generateCorrelationId,
  getCorrelationId,
  withCorrelationId,
  correlationMiddleware,
} from "./correlation.js";

describe("correlation utils", () => {
  describe("CORRELATION_ID_HEADER", () => {
    it("should be the correct header name", () => {
      expect(CORRELATION_ID_HEADER).toBe("x-correlation-id");
    });
  });

  describe("generateCorrelationId", () => {
    it("should return a UUID string", () => {
      const id = generateCorrelationId();
      expect(typeof id).toBe("string");
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique IDs on each call", () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("getCorrelationId", () => {
    it("should return correlation ID from request headers", () => {
      const mockReq: Partial<Request> = {
        headers: { "x-correlation-id": "test-id-123" },
      };
      expect(getCorrelationId(mockReq as Request)).toBe("test-id-123");
    });

    it("should return first element when header is an array", () => {
      const mockReq: Partial<Request> = {
        headers: { "x-correlation-id": ["first-id", "second-id"] },
      };
      expect(getCorrelationId(mockReq as Request)).toBe("first-id");
    });

    it("should return undefined when correlation ID header is missing", () => {
      const mockReq: Partial<Request> = {
        headers: {},
      };
      expect(getCorrelationId(mockReq as Request)).toBeUndefined();
    });
  });

  describe("withCorrelationId", () => {
    it("should add correlation ID to headers", () => {
      const headers = { "content-type": "application/json" };
      const result = withCorrelationId(headers, "my-correlation-id");
      expect(result[CORRELATION_ID_HEADER]).toBe("my-correlation-id");
      expect(result["content-type"]).toBe("application/json");
    });

    it("should not mutate the original headers object", () => {
      const headers = { "content-type": "application/json" };
      withCorrelationId(headers, "test-id");
      expect(headers).not.toHaveProperty(CORRELATION_ID_HEADER);
    });

    it("should override existing correlation ID", () => {
      const headers = { [CORRELATION_ID_HEADER]: "old-id" };
      const result = withCorrelationId(headers, "new-id");
      expect(result[CORRELATION_ID_HEADER]).toBe("new-id");
    });
  });

  describe("correlationMiddleware", () => {
    it("should add correlation ID to response and call next", () => {
      const middleware = correlationMiddleware();
      const mockReq: Partial<Request> & { correlationId?: string } = {
        headers: {},
      };
      const mockRes: Partial<Response> = { setHeader: vi.fn() };
      const mockNext: NextFunction = vi.fn();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        CORRELATION_ID_HEADER,
        expect.any(String),
      );
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should generate a new correlation ID when not present", () => {
      const middleware = correlationMiddleware();
      const mockReq: Partial<Request> = { headers: {} };
      const mockRes: Partial<Response> = { setHeader: vi.fn() };
      const setHeaderMock = mockRes.setHeader as ReturnType<typeof vi.fn>;
      const mockNext: NextFunction = vi.fn();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const setHeaderCall = setHeaderMock.mock.calls[0];
      expect(setHeaderCall[0]).toBe(CORRELATION_ID_HEADER);
      expect(typeof setHeaderCall[1]).toBe("string");
      expect(setHeaderCall[1].length).toBeGreaterThan(0);
    });

    it("should preserve existing correlation ID from request headers", () => {
      const existingId = "existing-correlation-id";
      const middleware = correlationMiddleware();
      const mockReq: Partial<Request> = {
        headers: { [CORRELATION_ID_HEADER]: existingId },
      };
      const mockRes: Partial<Response> = { setHeader: vi.fn() };
      const mockNext: NextFunction = vi.fn();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        CORRELATION_ID_HEADER,
        existingId,
      );
    });

    it("should store generated correlation ID on the request object", () => {
      const middleware = correlationMiddleware();
      const mockReq: Partial<Request> & { correlationId?: string } = {
        headers: {},
      };
      const mockRes: Partial<Response> = { setHeader: vi.fn() };
      const mockNext: NextFunction = vi.fn();

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.correlationId).toBeDefined();
      expect(typeof mockReq.correlationId).toBe("string");
    });
  });
});
