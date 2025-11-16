import type { Logger } from "@liexp/core/lib/logger/index.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { JWTProvider } from "../providers/jwt/jwt.provider.js";
import {
  buildServiceClientPayload,
  getServiceClientToken,
  makeM2MTokenProvider,
} from "../providers/m2mToken.provider.js";

describe("m2mToken.provider", () => {
  const mockLogger: Logger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  } as any;

  const mockJWT: JWTProvider = {
    signClient: vi.fn((payload: any) => () => "mock-signed-token"),
    signUser: vi.fn(),
    verifyClient: vi.fn(),
    verifyUser: vi.fn(),
  } as any;

  const mockConfig = {
    id: "service-client-id-123" as any,
    userId: "user-id-456" as any,
    permissions: ["AdminRead", "ChatCreate"] as any[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildServiceClientPayload", () => {
    it("should build ServiceClient payload with all fields", () => {
      const payload = buildServiceClientPayload(mockConfig);

      expect(payload).toEqual({
        id: "service-client-id-123",
        userId: "user-id-456",
        permissions: ["AdminRead", "ChatCreate"],
      });
    });

    it("should build payload with empty permissions array", () => {
      const payload = buildServiceClientPayload({
        id: "test-id" as any,
        userId: "test-user" as any,
        permissions: [] as any[],
      });

      expect(payload.permissions).toEqual([]);
    });

    it("should be a pure function (no side effects)", () => {
      const input = { ...mockConfig };
      const payload1 = buildServiceClientPayload(input);
      const payload2 = buildServiceClientPayload(input);

      expect(payload1).toEqual(payload2);
      expect(input).toEqual(mockConfig); // input unchanged
    });
  });

  describe("getServiceClientToken", () => {
    it("should sign ServiceClient payload and return token", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const token = getServiceClientToken(ctx)(mockConfig)();

      expect(mockJWT.signClient).toHaveBeenCalledWith({
        id: mockConfig.id,
        userId: mockConfig.userId,
        permissions: mockConfig.permissions,
      });
      expect(token).toBe("mock-signed-token");
    });

    it("should log token generation", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      getServiceClientToken(ctx)(mockConfig)();

      expect(mockLogger.debug.log).toHaveBeenCalledWith(
        expect.stringContaining("Signing ServiceClient token"),
        mockConfig.id,
      );
    });

    it("should return IO that can be executed multiple times", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const io = getServiceClientToken(ctx)(mockConfig);

      const token1 = io();
      const token2 = io();

      expect(token1).toBe("mock-signed-token");
      expect(token2).toBe("mock-signed-token");
      // signClient is called once per getServiceClientToken call
      // but the returned IO can be executed multiple times
      expect(mockJWT.signClient).toHaveBeenCalledTimes(1);
    });
  });

  describe("makeM2MTokenProvider", () => {
    it("should create provider with cached token", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const provider = makeM2MTokenProvider(ctx, mockConfig);

      const token1 = provider.getToken()();
      const token2 = provider.getToken()();

      expect(token1).toBe("mock-signed-token");
      expect(token2).toBe("mock-signed-token");
      expect(mockJWT.signClient).toHaveBeenCalledTimes(1); // cached after first call
    });

    it("should regenerate token when invalidated", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const provider = makeM2MTokenProvider(ctx, mockConfig);

      const token1 = provider.getToken()();
      provider.invalidateCache();
      const token2 = provider.getToken()();

      expect(token1).toBe("mock-signed-token");
      expect(token2).toBe("mock-signed-token");
      expect(mockJWT.signClient).toHaveBeenCalledTimes(2);
    });

    it("should log cache hit on subsequent calls", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const provider = makeM2MTokenProvider(ctx, mockConfig);

      provider.getToken()();
      vi.clearAllMocks();
      provider.getToken()();

      expect(mockLogger.debug.log).toHaveBeenCalledWith(
        expect.stringContaining("Using cached M2M token"),
      );
    });

    it("should log invalidation", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const provider = makeM2MTokenProvider(ctx, mockConfig);

      provider.getToken()();
      provider.invalidateCache();

      expect(mockLogger.debug.log).toHaveBeenCalledWith(
        expect.stringContaining("Invalidating M2M token cache"),
      );
    });

    it("should handle token generation on first call after invalidation", () => {
      const ctx = { jwt: mockJWT, logger: mockLogger };
      const provider = makeM2MTokenProvider(ctx, mockConfig);

      provider.invalidateCache();
      const token = provider.getToken()();

      expect(token).toBe("mock-signed-token");
      expect(mockJWT.signClient).toHaveBeenCalledTimes(1);
    });
  });
});
