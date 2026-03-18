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

    it("Should return error with undefined meta when no meta provided", () => {
      const error = ServerError.of();

      expect(error.details.meta).toBeUndefined();
    });
  });

  describe("fromUnknown", () => {
    it("Should extract message and stack from Error instance", () => {
      const originalError = new Error("Something went wrong");
      const error = ServerError.fromUnknown(originalError);

      expect(error.message).toBe("Something went wrong");
      expect(error.status).toBe(500);
      expect(error.name).toBe("ServerError");
      expect(error.details.kind).toBe("ServerError");
      expect(error.details.meta).toContain(originalError.stack);
    });

    it("Should handle non-Error values by JSON stringifying", () => {
      const unknownValue = { code: 404, reason: "Not found" };
      const error = ServerError.fromUnknown(unknownValue);

      expect(error.message).toBe("Unknown error");
      expect(error.status).toBe(500);
      expect(error.details.meta).toContain(JSON.stringify(unknownValue));
    });

    it("Should handle null value", () => {
      const error = ServerError.fromUnknown(null);

      expect(error.message).toBe("Unknown error");
      expect(error.status).toBe(500);
    });

    it("Should handle undefined value", () => {
      const error = ServerError.fromUnknown(undefined);

      expect(error.message).toBe("Unknown error");
      expect(error.status).toBe(500);
    });

    it("Should handle primitive values", () => {
      const error = ServerError.fromUnknown("string error");

      expect(error.message).toBe("Unknown error");
      expect(error.details.meta).toContain('"string error"');
    });
  });
});
