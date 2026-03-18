import { IOError } from "@ts-endpoint/core";
import { describe, expect, it } from "vitest";
import { toControllerError, report } from "./error.middleware.js";

describe("toControllerError", () => {
  it("should return IOError as-is if already an IOError", () => {
    const ioError = new IOError("Already an IOError", {
      kind: "ClientError",
      status: "400",
    });
    const result = toControllerError(ioError);
    expect(result).toBe(ioError);
  });

  it("should convert generic Error to IOError with 500 status", () => {
    const error = new Error("Something went wrong");
    const result = toControllerError(error);
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("Something went wrong");
  });

  it("should convert unknown value to IOError", () => {
    const result = toControllerError({ message: "Unknown error" });
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("Unknown error");
  });

  it("should handle null values", () => {
    const result = toControllerError(null);
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("Unknown Error");
  });

  it("should handle undefined values", () => {
    const result = toControllerError(undefined);
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("Unknown Error");
  });
});

describe("report", () => {
  it("should format IOError with name and message", () => {
    const error = new IOError("Test error", {
      kind: "ClientError",
      status: "400",
    });
    const result = report(error);
    expect(result).toContain("[IOError]");
    expect(result).toContain("Test error");
  });
});
