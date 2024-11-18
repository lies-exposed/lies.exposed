import { describe, expect, it } from "vitest";
import { NotFoundError, toNotFoundError } from "../NotFoundError.js";

describe(NotFoundError.name, () => {
  describe("toNotFoundError", () => {
    it("Should return an APIError with status 404 when the error is a NotFoundError", () => {
      const error = toNotFoundError("Melon");
      expect(error).toMatchObject({
        status: 404,
        name: NotFoundError.name,
        message: "Can't find resource Melon",
        details: {
          kind: "ServerError",
          status: "404",
        },
      });
    });
  });
});
