import * as logger from "@liexp/core/lib/logger/index.js";
import type { UserEncoded } from "@liexp/io/lib/http/User.js";
import type { AuthPermission } from "@liexp/io/lib/http/auth/permissions/index.js";
import type { ServiceClient } from "@liexp/io/lib/http/auth/service-client/ServiceClient.js";
import type { Request } from "express";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { GetJWTProvider, JWTError } from "../../providers/jwt/jwt.provider.js";
import { RequestDecoder } from "./request.decoder.js";

const testSecret = "test-request-decoder-secret";
const testLogger = logger.GetLogger("test");
const jwtProvider = GetJWTProvider({ secret: testSecret, logger: testLogger });

const testUser = {
  id: "00000001-0001-1000-8000-000000000001",
  username: "testuser",
  email: "test@example.com",
  permissions: ["admin:create" as const],
} as unknown as UserEncoded;

const testClient = {
  id: "00000001-0001-1000-8000-000000000002",
  userId: "00000001-0001-1000-8000-000000000003",
  permissions: ["admin:create" as const],
} as unknown as ServiceClient;

const makeCtx = () => ({
  logger: testLogger,
  jwt: jwtProvider,
});

const makeReqWithToken = (token: string): Request =>
  ({
    headers: {
      authorization: token,
    },
  }) as unknown as Request;

const makeReqWithoutToken = (): Request =>
  ({
    headers: {},
  }) as unknown as Request;

describe("RequestDecoder", () => {
  describe("decodeUserFromRequest", () => {
    it("should return Right with user when valid token is provided", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [])(ctx)();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(testUser.id);
      }
    });

    it("should return Right with Bearer token", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(`Bearer ${token}`);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [])(ctx)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when no authorization header is present", () => {
      const req = makeReqWithoutToken();
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [])(ctx)();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Left when invalid token is provided", () => {
      const req = makeReqWithToken("invalid.token");
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [])(ctx)();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(JWTError);
      }
    });

    it("should return Right when user has all required permissions", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [
        "admin:create" as AuthPermission,
      ])(ctx)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when user lacks required permissions", () => {
      const token = jwtProvider.signUser({ ...testUser, permissions: [] })();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserFromRequest(req, [
        "admin:delete" as AuthPermission,
      ])(ctx)();
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("decodeNullableUser", () => {
    it("should return user when valid token provided", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeNullableUser(req, [])(ctx)();
      expect(result).not.toBeNull();
      expect(result?.id).toBe(testUser.id);
    });

    it("should return null when no token provided", () => {
      const req = makeReqWithoutToken();
      const ctx = makeCtx();

      const result = RequestDecoder.decodeNullableUser(req, [])(ctx)();
      expect(result).toBeNull();
    });

    it("should return null when invalid token provided", () => {
      const req = makeReqWithToken("bad.token");
      const ctx = makeCtx();

      const result = RequestDecoder.decodeNullableUser(req, [])(ctx)();
      expect(result).toBeNull();
    });
  });

  describe("decodeServiceClientFromRequest", () => {
    it("should return Right with service client when valid client token provided", () => {
      const token = jwtProvider.signClient(testClient)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeServiceClientFromRequest(
        req,
        [],
      )(ctx)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when no authorization header provided", () => {
      const req = makeReqWithoutToken();
      const ctx = makeCtx();

      const result = RequestDecoder.decodeServiceClientFromRequest(
        req,
        [],
      )(ctx)();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Left when user token provided (not client token)", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeServiceClientFromRequest(
        req,
        [],
      )(ctx)();
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("decodeNullableServiceClient", () => {
    it("should return service client when valid token provided", () => {
      const token = jwtProvider.signClient(testClient)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeNullableServiceClient(req, [])(ctx)();
      expect(result).not.toBeNull();
    });

    it("should return null when no token provided", () => {
      const req = makeReqWithoutToken();
      const ctx = makeCtx();

      const result = RequestDecoder.decodeNullableServiceClient(req, [])(ctx)();
      expect(result).toBeNull();
    });
  });

  describe("decodeUserOrServiceClient", () => {
    it("should return Right with user when valid user token provided", () => {
      const token = jwtProvider.signUser(testUser)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserOrServiceClient(req, [])(ctx)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Right with service client when valid client token provided", () => {
      const token = jwtProvider.signClient(testClient)();
      const req = makeReqWithToken(token);
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserOrServiceClient(req, [])(ctx)();
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when no token provided", () => {
      const req = makeReqWithoutToken();
      const ctx = makeCtx();

      const result = RequestDecoder.decodeUserOrServiceClient(req, [])(ctx)();
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
