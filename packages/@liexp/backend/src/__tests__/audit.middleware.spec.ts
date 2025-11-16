import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import type { Logger } from "@liexp/core/lib/logger/index.js";
import { makeAuditMiddleware } from "../express/middleware/audit.middleware.js";

describe("audit.middleware", () => {
  const mockLogger: Logger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  } as any;

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      method: "GET",
      path: "/api/test",
      headers: {},
    };

    const onMock = vi.fn();
    mockResponse = {
      statusCode: 200,
      on: onMock,
      setHeader: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe("makeAuditMiddleware", () => {
    it("should log incoming request", () => {
      const middleware = makeAuditMiddleware({ logger: mockLogger });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockLogger.info.log).toHaveBeenCalledWith(
        expect.stringContaining("Incoming request"),
        "GET",
        "/api/test",
        "none",
        "anonymous",
      );
    });

    it("should log correlation ID when present", () => {
      mockRequest.headers = { "x-correlation-id": "corr-123" };
      const middleware = makeAuditMiddleware({ logger: mockLogger });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockLogger.info.log).toHaveBeenCalledWith(
        expect.stringContaining("Incoming request"),
        "GET",
        "/api/test",
        "corr-123",
        "anonymous",
      );
    });

    it("should extract user context when getUserContext provided", () => {
      const mockUser = { id: "user-123", email: "test@example.com" };
      const middleware = makeAuditMiddleware({
        logger: mockLogger,
        getUserContext: (req) => mockUser,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockLogger.info.log).toHaveBeenCalledWith(
        expect.stringContaining("Incoming request"),
        "GET",
        "/api/test",
        "none",
        mockUser,
      );
    });

    it("should call next middleware", () => {
      const middleware = makeAuditMiddleware({ logger: mockLogger });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should log request completion with duration", () => {
      const middleware = makeAuditMiddleware({ logger: mockLogger });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Trigger response completion by calling the finish event handler
      const onMock = mockResponse.on as any;
      const finishHandler = onMock.mock.calls.find(
        (call: any[]) => call[0] === "finish",
      )[1];
      finishHandler();

      expect(mockLogger.info.log).toHaveBeenCalledWith(
        expect.stringContaining("Request completed"),
        "GET",
        "/api/test",
        200,
        expect.any(Number),
        "none",
      );
    });

    it("should capture response status code", () => {
      const middleware = makeAuditMiddleware({ logger: mockLogger });
      mockResponse.statusCode = 404;

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Trigger response completion by calling the finish event handler
      const onMock = mockResponse.on as any;
      const finishHandler = onMock.mock.calls.find(
        (call: any[]) => call[0] === "finish",
      )[1];
      finishHandler();

      expect(mockLogger.info.log).toHaveBeenCalledWith(
        expect.stringContaining("Request completed"),
        "GET",
        "/api/test",
        404,
        expect.any(Number),
        "none",
      );
    });

    it("should measure request duration accurately", async () => {
      const middleware = makeAuditMiddleware({ logger: mockLogger });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Trigger response completion by calling the finish event handler
      const onMock = mockResponse.on as any;
      const finishHandler = onMock.mock.calls.find(
        (call: any[]) => call[0] === "finish",
      )[1];
      finishHandler();

      const completionLog = (mockLogger.info.log as any).mock.calls.find(
        (call: any[]) => call[0].includes("Request completed"),
      );
      const duration = completionLog[4];

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(200); // reasonable upper bound
    });
  });
});
