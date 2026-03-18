import { describe, expect, it } from "vitest";
import { SpaceError, toError } from "./space.provider.js";

describe("space.provider", () => {
  describe("SpaceError", () => {
    it("should have name SpaceError", () => {
      const error = toError(new Error("Test"));
      expect(error.name).toBe("SpaceError");
    });
  });

  describe("toError", () => {
    it("should return SpaceError as-is if already a SpaceError", () => {
      const spaceError = new SpaceError("Already a space error", {
        kind: "ClientError",
        status: "400",
      });
      const result = toError(spaceError);
      expect(result).toBe(spaceError);
    });

    it("should convert Error to SpaceError with message", () => {
      const error = new Error("Space upload failed");
      const result = toError(error);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.name).toBe("SpaceError");
      expect(result.message).toBe("Space upload failed");
    });

    it("should handle non-Error values", () => {
      const result = toError("Connection refused");

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle null value", () => {
      const result = toError(null);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle undefined value", () => {
      const result = toError(undefined);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle object value", () => {
      const result = toError({ code: "ENOENT" });

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle number value", () => {
      const result = toError(123);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle boolean value", () => {
      const result = toError(false);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });

    it("should handle array value", () => {
      const result = toError(["error1", "error2"]);

      expect(result).toBeInstanceOf(SpaceError);
      expect(result.message).toBe("Internal Error");
    });
  });
});
