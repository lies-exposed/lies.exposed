import { describe, expect, it, vi } from "vitest";
import { NERError, toError } from "../ner.provider.js";
import { IOError } from "@ts-endpoint/core";

describe("NERError", () => {
  it("extends IOError", () => {
    const err = new NERError("test", {
      kind: "ServerError",
      status: "500",
    });
    expect(err).toBeInstanceOf(IOError);
    expect(err.name).toBe("NERError");
  });
});

describe("toError", () => {
  const mockLogger = {
    error: { log: vi.fn() },
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  };

  it("returns the same IOError instance if input is already an IOError", () => {
    const ioError = new IOError("existing", {
      kind: "DecodingError",
      status: "400",
    });
    const result = toError(mockLogger as any)()(ioError);
    expect(result).toBe(ioError);
  });

  it("wraps plain Error as NERError", () => {
    const error = new Error("message");
    const result = toError(mockLogger as any)()(error);
    expect(result).toBeInstanceOf(NERError);
    expect(result.message).toBe("message");
    expect(result.details.kind).toBe("ServerError");
    expect(result.details.status).toBe("500");
  });

  it("wraps plain Error as NERError with custom status", () => {
    const error = new Error("message");
    const result = toError(mockLogger as any)({ status: "422" })(error);
    expect(result).toBeInstanceOf(NERError);
    expect(result.details.status).toBe("422");
  });

  it("wraps unknown values as IOError", () => {
    const result = toError(mockLogger as any)()("string error");
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("An error occurred");
  });

  it("wraps null as IOError", () => {
    const result = toError(mockLogger as any)()(null);
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("An error occurred");
  });

  it("wraps object as IOError", () => {
    const result = toError(mockLogger as any)()({ code: 500 });
    expect(result).toBeInstanceOf(IOError);
    expect(result.message).toBe("An error occurred");
    expect(result.details.meta).toEqual(["[object Object]"]);
  });

  it("logs error message", () => {
    toError(mockLogger as any)(new Error("test"));
    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "An error occurred %O",
      expect.any(Error),
    );
  });
});
