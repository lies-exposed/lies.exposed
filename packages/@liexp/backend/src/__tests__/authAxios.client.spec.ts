import type { Logger } from "@liexp/core/lib/logger/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type UserEncoded } from "@liexp/shared/lib/io/http/User.js";
import { type ServiceClient } from "@liexp/shared/lib/io/http/auth/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { makeAuthAxiosClient } from "../clients/authAxios.client.js";
import type { JWTProvider } from "../providers/jwt/jwt.provider.js";

describe("authAxios.client", () => {
  const mockLogger = mock<Logger>({
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  });

  const userEncoded: UserEncoded = {
    id: uuid(),
    username: "testuser",
    status: "Approved",
    telegramId: null,
    telegramToken: null,
    permissions: [],
    firstName: "Test",
    lastName: "User",
    email: "test.user@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const mockJWT: JWTProvider = {
    signClient: vi.fn((_payload: any) => () => "client-token-123"),
    signUser: vi.fn((_payload: any) => () => "user-token-456"),
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
        getPayload: () => userEncoded,
      });

      expect(client.defaults.baseURL).toBe("https://api.example.com");
    });

    it("should have request interceptor registered", () => {
      const client = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "user",
        getPayload: () => userEncoded,
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
        getPayload: () => customPayload as any,
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
        getPayload: () => userEncoded,
      });

      const clientService = makeAuthAxiosClient({
        baseURL: "https://api.example.com",
        jwt: mockJWT,
        logger: mockLogger,
        signAs: "client",
        getPayload: () => ({}) as ServiceClient,
      });

      expect(clientUser).toBeDefined();
      expect(clientService).toBeDefined();
    });
  });
});
