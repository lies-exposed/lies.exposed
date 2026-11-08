import type { ParseError } from "effect/ParseResult";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { throwValidationErrors } from "../throwValidationErrors.js";

describe("throwValidationErrors", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should log the error details to console", () => {
    const mockErrors = {
      issues: [{ path: ["field"], message: "invalid" }],
      message: "Validation failed",
      toJSON: () => ({ issues: [{ path: ["field"], message: "invalid" }] }),
    } as unknown as ParseError;

    const result = throwValidationErrors(mockErrors);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith({
      issues: [{ path: ["field"], message: "invalid" }],
    });
    expect(result).toBeNull();
  });

  it("should return null", () => {
    const mockErrors = {
      issues: [],
      message: "ok",
      toJSON: () => ({ issues: [] }),
    } as unknown as ParseError;

    const result = throwValidationErrors(mockErrors);
    expect(result).toBeNull();
  });

  it("should handle empty parse errors", () => {
    const mockErrors = {
      issues: [],
      message: "",
      toJSON: () => ({ issues: [], message: "" }),
    } as unknown as ParseError;

    const result = throwValidationErrors(mockErrors);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith({ issues: [], message: "" });
  });

  it("should call toJSON on the parse errors", () => {
    const mockErrors = {
      toJSON: vi.fn().mockReturnValue({ custom: "output" }),
    } as unknown as ParseError;

    throwValidationErrors(mockErrors);

    expect(mockErrors.toJSON).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith({ custom: "output" });
  });
});
