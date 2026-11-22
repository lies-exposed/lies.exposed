import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { throwValidationErrors } from "../throwValidationErrors.js";

const decodeFailure = (input: unknown): ParseError => {
  const result = Schema.decodeUnknownEither(Schema.String)(input, {
    errors: "all",
  });
  if (result._tag === "Right") {
    throw new Error("Expected a decode failure");
  }
  return result.left;
};

describe("throwValidationErrors", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should log the error details to console", () => {
    const parseErrors = decodeFailure({ field: "invalid" });

    const result = throwValidationErrors(parseErrors);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(parseErrors.toJSON());
    expect(result).toBeNull();
  });

  it("should return null", () => {
    const parseErrors = decodeFailure(123);

    const result = throwValidationErrors(parseErrors);
    expect(result).toBeNull();
  });

  it("should handle empty parse errors", () => {
    const parseErrors = decodeFailure(123);

    const result = throwValidationErrors(parseErrors);

    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(parseErrors.toJSON());
  });

  it("should call toJSON on the parse errors", () => {
    const parseErrors = decodeFailure(123);
    const expected = { _id: "ParseError", message: "custom output" };
    const toJSONSpy = vi.fn((): ReturnType<ParseError["toJSON"]> => expected);
    parseErrors.toJSON = toJSONSpy;

    throwValidationErrors(parseErrors);

    expect(toJSONSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expected);
  });
});
