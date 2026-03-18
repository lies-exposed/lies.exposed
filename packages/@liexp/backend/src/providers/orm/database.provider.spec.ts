import { describe, expect, it } from "vitest";
import { DBError, toDBError } from "./database.provider.js";

describe("database.provider", () => {
  describe("DBError", () => {
    it("should be an instance of Error", () => {
      const error = toDBError()(new Error("Test"));
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toDBError", () => {
    it("should convert Error to DBError with message", () => {
      const error = new Error("Database error");
      const result = toDBError()(error);

      expect(result).toBeInstanceOf(DBError);
      expect(result.name).toBe("DBError");
      expect(result.message).toBe("Database error");
    });

    it("should include meta with error name and stack", () => {
      const error = new Error("Test error");
      const result = toDBError()(error);

      const details = (result as any).details;
      expect(details).toBeDefined();
    });

    it("should use custom status from override", () => {
      const error = new Error("Not found");
      const result = toDBError({ status: 404 })(error);

      expect(result.status).toBe(404);
    });

    it("should handle IOError by returning as DBError", () => {
      const ioError = new DBError("IO error", {
        kind: "ClientError",
        status: "400",
      });

      const result = toDBError()(ioError);
      expect(result).toBe(ioError);
    });

    it("should handle non-Error values", () => {
      const result = toDBError()("Unknown database error");

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle null value", () => {
      const result = toDBError()(null);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle undefined value", () => {
      const result = toDBError()(undefined);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle number value", () => {
      const result = toDBError()(123);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle object value", () => {
      const result = toDBError()({ code: "ECONNREFUSED" });

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle boolean false value", () => {
      const result = toDBError()(false);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should handle array value", () => {
      const result = toDBError()(["error1", "error2"]);

      expect(result).toBeInstanceOf(DBError);
      expect(result.message).toBe("An error occurred");
    });

    it("should convert numeric override status to string", () => {
      const error = new Error("Test");
      const result = toDBError({ status: 500 })(error);

      expect(result.status).toBe(500);
    });

    it("should handle object with custom status", () => {
      const error = new Error("Test");
      const result = toDBError({ status: 404 })(error);

      expect(result.status).toBe(404);
    });
  });
});
