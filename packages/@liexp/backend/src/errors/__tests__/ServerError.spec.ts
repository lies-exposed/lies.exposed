import { describe, expect, it } from "vitest";
import { ServerError } from "../ServerError.js";

describe(ServerError.name, () => {
  describe("of", () => {
    it("Should return an APIError with status 500 when the error is a ServerError", () => {
      const error = ServerError.of(["Failed to fetch melons"]);

      expect(error).toMatchObject({
        status: 500,
        name: "ServerError",
        message: "Server Error",
        details: {
          kind: "ServerError",
          status: "500",
          meta: ["Failed to fetch melons"],
        },
      });
    });
  });
});
