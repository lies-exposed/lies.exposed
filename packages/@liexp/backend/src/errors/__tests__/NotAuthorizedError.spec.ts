import { describe, expect, it } from "vitest";
import {
  NotAuthorizedError,
  toNotAuthorizedError,
} from "../NotAuthorizedError.js";

describe(NotAuthorizedError.name, () => {
  describe("toNotAuthorizedError", () => {
    it("Should return an APIError with status 401 when the error is a NotAuthorizedError", () => {
      const error = toNotAuthorizedError();

      expect(error).toMatchObject({
        status: 401,
        name: NotAuthorizedError.name,
        message: "Authorization header [Authorization] is missing",
        details: {
          kind: "ClientError",
          status: "401",
        },
      });
    });
  });
});
