import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import {
  toNotAuthorizedError,
  IOError,
} from "@liexp/backend/lib/errors/index.js";
import { JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { UnauthorizedError } from "express-jwt";
import * as t from "io-ts";
import { toAPIError, toControllerError } from "./ControllerError.js";

describe("ControllerError", () => {
  describe("toControllerError", () => {
    it("Should return a ControllerError with status 500 from IOError", () => {
      const error = new IOError("DBError", {
        kind: "ServerError",
        status: "500",
        meta: ["Failed to fetch melons"],
      });
      const controllerError = toControllerError(error);
      expect(controllerError).toMatchObject(error);
    });

    it("Should return a ControllerError with status 400", () => {
      const error = new IOError("BadRequestError", {
        kind: "ClientError",
        status: "400",
        meta: ["Melon"],
      });

      const controllerError = toControllerError(error);
      expect(controllerError.message).toBe("BadRequestError");
      expect(controllerError).toMatchObject({
        status: 400,
        details: {
          kind: "ClientError",
          meta: ["Melon"],
        },
      });
    });

    it("Should return an APIError with status 401 when the error is an UnauthorizedError", () => {
      const error = new UnauthorizedError(
        "invalid_token",
        new Error("Invalid token"),
      );
      const controllerError = toControllerError(error);

      expect(controllerError).toMatchObject({
        status: 401,
        details: {
          kind: "ClientError",
          status: "401",
          meta: [error.stack],
        },
      });
    });
  });

  describe("toAPIError", () => {
    it("Should return an APIError with status 400 when the error is a DecodeError", () => {
      const error = DecodeError.of(
        "Failed to decode melon",
        pipe(
          t.array(t.string).decode("melon"),
          fp.E.fold(
            (e) => e,
            () => [],
          ),
        ),
      );
      const apiError = toAPIError(error);
      expect(apiError).toEqual({
        status: 400,
        name: "APIError",
        message: "Failed to decode melon",
        details: ['Invalid value "melon" supplied to : Array<string>'],
      });
    });

    it("Should return an APIError with status 401 when the error is a NotAuthorizedError", () => {
      const error = toNotAuthorizedError();
      const apiError = toAPIError(error);
      expect(apiError).toEqual({
        status: 401,
        name: "APIError",
        message: "Authorization header [Authorization] is missing",
        details: [],
      });
    });

    it("Should return an APIError with status 401 when the error is a JWTError", () => {
      const error = new JWTError("Wrong token", {
        kind: "DecodingError",
        errors: [],
      });
      const apiError = toAPIError(error);
      expect(apiError).toEqual({
        status: 401,
        name: "APIError",
        message: "Wrong token",
        details: [],
      });
    });

    it("Should return an APIError with status 404 when the error is a NotFoundError", () => {
      const error = toNotFoundError("Melon");
      const apiError = toAPIError(error);
      expect(apiError).toEqual({
        status: 404,
        name: "APIError",
        message: "Can't find resource Melon",
        details: [],
      });
    });

    it("Should return an APIError with status 500 when the error is a ServerError", () => {
      const error = ServerError.of(["Failed to fetch melons"]);
      const apiError = toAPIError(error);
      expect(apiError).toEqual({
        status: 500,
        name: "APIError",
        message: "Server Error",
        details: ["Failed to fetch melons"],
      });
    });
  });
});
