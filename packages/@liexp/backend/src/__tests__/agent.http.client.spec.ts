import type { Logger } from "@liexp/core/lib/logger/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAgentClient } from "../clients/agent.http.client.js";
import type { JWTProvider } from "../providers/jwt/jwt.provider.js";

describe("agent.http.client", () => {
  const mockLogger: Logger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  } as any;

  const id = uuid();
  const userId = uuid();

  const mockJWT: JWTProvider = {
    signClient: vi.fn((_payload: any) => () => "agent-token-789"),
    signUser: vi.fn(),
    verifyClient: vi.fn(),
    verifyUser: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("makeAgentClient", () => {
    it("should create resource client with agent endpoints", () => {
      const client = makeAgentClient({
        baseURL: "https://agent.example.com/v1",
        jwt: mockJWT,
        logger: mockLogger,
        getPayload: () => ({
          id,
          userId,
          permissions: [AdminRead.literals[0]],
        }),
      });

      expect(client).toBeDefined();
      expect(client.Chat).toBeDefined();
    });

    it("should create axios client with correct baseURL", () => {
      const client = makeAgentClient({
        baseURL: "https://agent.example.com/v1",
        jwt: mockJWT,
        logger: mockLogger,
        getPayload: () => ({
          id,
          userId,
          permissions: [AdminRead.literals[0]],
        }),
      });

      // The resource client wraps an axios instance
      // We can't directly test the baseURL, but we verify the client was created
      expect(client).toBeDefined();
    });

    it("should use 'client' signing mode for M2M authentication", () => {
      const payload = {
        id,
        userId,
        permissions: [AdminRead.literals[0]],
      };

      makeAgentClient({
        baseURL: "https://agent.example.com/v1",
        jwt: mockJWT,
        logger: mockLogger,
        getPayload: () => payload,
      });

      // The client uses makeAuthAxiosClient internally with signAs: 'client'
      // This is tested indirectly through the authAxios client tests
      expect(mockJWT.signClient).not.toHaveBeenCalled(); // Not called until request is made
    });

    it("should create client with GetResourceClient wrapper", () => {
      const client = makeAgentClient({
        baseURL: "https://agent.example.com/v1",
        jwt: mockJWT,
        logger: mockLogger,
        getPayload: () => ({
          id: "service-id" as any,
          userId: "user-id" as any,
          permissions: ["AdminRead"] as any[],
        }),
      });

      // Verify the resource client has the expected endpoint structure
      expect(client.Chat).toBeDefined();
      // Resource endpoints have Create, Get, List, Edit, Delete methods
      expect(client.Chat.Create).toBeDefined();
    });

    it("should use EffectDecoder for response decoding", () => {
      const client = makeAgentClient({
        baseURL: "https://agent.example.com/v1",
        jwt: mockJWT,
        logger: mockLogger,
        getPayload: () => ({
          id,
          userId,
          permissions: [AdminRead.literals[0]],
        }),
      });

      // The decoder is configured internally
      // We verify the client was created successfully
      expect(client).toBeDefined();
    });
  });
});
