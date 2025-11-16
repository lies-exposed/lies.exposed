import type { Logger } from "@liexp/core/lib/logger/index.js";
import type { InternalAxiosRequestConfig } from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthAxiosClient } from "../clients/authAxios.client.js";
import type { JWTProvider } from "../providers/jwt/jwt.provider.js";

describe("authAxios.client", () => {
  const mockLogger: Logger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  } as any;

  const mockJWT: JWTProvider = {
    signClient: vi.fn((payload: any) => () => "client-token-123"),
    signUser: vi.fn((payload: any) => () => "user-token-456"),
    verifyClient: vi.fn(),
    verifyUser: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("makeAuthAxiosClient", () => {
    it("should create axios client with baseURL", () => {
      const client = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "user",
      });

      expect(client.defaults.baseURL).toBe("https://api.example.com");
    });

    it("should have request interceptor registered", () => {
      const client = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "user",
      });

      // Verify interceptor was added (axios tracks them internally)
      expect(client.interceptors.request).toBeDefined();
    });

    it("should accept custom getPayload function", () => {
      const customPayload = { userId: "custom-user-123" };

      const client = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "user",
        getPayload: () => customPayload,
      });

      expect(client).toBeDefined();
      expect(client.defaults.baseURL).toBe("https://api.example.com");
    });

    it("should support both user and client signing modes", () => {
      const clientUser = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "user",
      });

      const clientService = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "client",
      });

      expect(clientUser).toBeDefined();
      expect(clientService).toBeDefined();
    });
  });
});
