import * as coreLogger from "@liexp/core/lib/logger/index.js";
import type { UserEncoded } from "@liexp/io/lib/http/User.js";
import type { ServiceClient } from "@liexp/io/lib/http/auth/service-client/ServiceClient.js";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { GetJWTProvider, JWTError } from "./jwt.provider.js";

const testSecret = "test-secret-key-for-testing";
const logger = coreLogger.GetLogger("test");

const provider = GetJWTProvider({ secret: testSecret, logger });

// Minimal user payload matching AuthUser schema
const testUser = {
  id: "00000001-0001-1000-8000-000000000001",
  username: "testuser",
  email: "test@example.com",
  permissions: ["admin:create" as const],
} as unknown as UserEncoded;

// Minimal service client payload
const testClient = {
  id: "00000001-0001-1000-8000-000000000002",
  userId: "00000001-0001-1000-8000-000000000003",
  permissions: ["admin:create" as const],
} as unknown as ServiceClient;

describe("GetJWTProvider", () => {
  describe("signUser", () => {
    it("should return a non-empty JWT string", () => {
      const token = provider.signUser(testUser)();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should return a valid JWT with three parts (header.payload.signature)", () => {
      const token = provider.signUser(testUser)();
      const parts = token.split(".");
      expect(parts.length).toBe(3);
    });

    it("should return a string on subsequent calls", () => {
      const token1 = provider.signUser(testUser)();
      const token2 = provider.signUser(testUser)();
      expect(typeof token1).toBe("string");
      expect(typeof token2).toBe("string");
    });
  });

  describe("signClient", () => {
    it("should return a non-empty JWT string for service client", () => {
      const token = provider.signClient(testClient)();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe("verifyUser", () => {
    it("should verify a valid user token and return Right", () => {
      const token = provider.signUser(testUser)();
      const result = provider.verifyUser(token)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should verify a token with Bearer prefix", () => {
      const token = provider.signUser(testUser)();
      const result = provider.verifyUser(`Bearer ${token}`)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left for an invalid token", () => {
      const result = provider.verifyUser("invalid.token.here")();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(JWTError);
      }
    });

    it("should return Left for an empty token", () => {
      const result = provider.verifyUser("")();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Left for a token signed with a different secret", () => {
      const otherProvider = GetJWTProvider({
        secret: "different-secret",
        logger,
      });
      const token = otherProvider.signUser(testUser)();
      const result = provider.verifyUser(token)();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return the user data on successful verification", () => {
      const token = provider.signUser(testUser)();
      const result = provider.verifyUser(token)();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(testUser.id);
        expect(result.right.email).toBe(testUser.email);
      }
    });
  });

  describe("verifyClient", () => {
    it("should verify a valid client token and return Right", () => {
      const token = provider.signClient(testClient)();
      const result = provider.verifyClient(token)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left for an invalid client token", () => {
      const result = provider.verifyClient("invalid.token.here")();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Left for a user token when verifying as client", () => {
      const userToken = provider.signUser(testUser)();
      const result = provider.verifyClient(userToken)();
      // User token lacks service client fields, should fail validation
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

describe("JWTError", () => {
  it("should have name JWTError", () => {
    const error = new JWTError("Test error", {
      kind: "ClientError",
      status: "401",
    });
    expect(error.name).toBe("JWTError");
  });

  it("should have the correct message", () => {
    const error = new JWTError("Test error message", {
      kind: "ClientError",
      status: "401",
    });
    expect(error.message).toBe("Test error message");
  });
});
