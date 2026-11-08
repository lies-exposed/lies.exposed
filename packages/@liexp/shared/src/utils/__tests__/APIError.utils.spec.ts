import { describe, expect, it } from "vitest";
import {
  fromIOError,
  reportIOErrorDetails,
  decodeIOErrorDetails,
} from "../APIError.utils.js";

describe("APIError.utils", () => {
  describe("fromIOError", () => {
    it("should convert a DecodingError IOError to APIError with status 400", () => {
      const ioError = {
        name: "IOError",
        message: "Decoding failed",
        status: 600,
        details: {
          kind: "DecodingError",
          errors: ["Field 'email' is required"],
          status: "600",
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(400);
      expect(result.name).toBe("APIError");
      expect(result.message).toBe("Decoding failed");
      expect(result.details).toEqual(["Field 'email' is required"]);
    });

    it("should return undefined details when DecodingError has no errors", () => {
      const ioError = {
        name: "IOError",
        message: "Empty decoding error",
        status: 600,
        details: {
          kind: "DecodingError",
          errors: [],
          status: "600",
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(400);
      expect(result.details).toBeUndefined();
    });

    it("should handle ClientError with meta object", () => {
      const ioError = {
        name: "IOError",
        message: "Bad request",
        status: 400,
        details: {
          kind: "ClientError",
          status: "400",
          meta: { field: "email", reason: "invalid" },
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(400);
      expect(result.name).toBe("APIError");
      expect(result.message).toBe("Bad request");
      expect(result.details).toEqual(['{"field":"email","reason":"invalid"}']);
    });

    it("should handle ClientError with meta array", () => {
      const ioError = {
        name: "IOError",
        message: "Validation failed",
        status: 422,
        details: {
          kind: "ClientError",
          status: "422",
          meta: ["error1", "error2"],
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(500);
      expect(result.details).toEqual(["error1", "error2"]);
    });

    it("should handle ServerError", () => {
      const ioError = {
        name: "IOError",
        message: "Internal error",
        status: 500,
        details: {
          kind: "ServerError",
          status: "500",
          meta: { code: "INTERNAL" },
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(500);
      expect(result.message).toBe("Internal error");
    });

    it("should handle NetworkError", () => {
      const ioError = {
        name: "IOError",
        message: "Network timeout",
        status: 500,
        details: {
          kind: "NetworkError",
          status: "500",
          meta: undefined,
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(500);
      expect(result.details).toBeUndefined();
    });

    it("should map unknown status codes to 500", () => {
      const ioError = {
        name: "IOError",
        message: "Unknown status",
        status: 418,
        details: {
          kind: "ClientError",
          status: "418",
          meta: null,
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(500);
    });

    it("should pass through known status codes", () => {
      for (const status of [200, 201, 400, 401, 403, 404, 500]) {
        const ioError = {
          name: "IOError",
          message: "Test",
          status,
          details: {
            kind: "ClientError",
            status: String(status),
            meta: null,
          },
        } as any;

        const result = fromIOError(ioError);
        expect(result.status).toBe(status);
      }
    });

    it("should map DecodingError to status 400 regardless of status code", () => {
      const ioError = {
        name: "IOError",
        message: "Decoding error with 500 status",
        status: 500,
        details: {
          kind: "DecodingError",
          errors: ["parse error"],
          status: "500",
        },
      } as any;

      const result = fromIOError(ioError);
      expect(result.status).toBe(400);
    });
  });

  describe("reportIOErrorDetails", () => {
    it("should return empty string for null details", () => {
      expect(reportIOErrorDetails(null as any)).toBe("");
    });

    it("should return empty string for undefined details", () => {
      expect(reportIOErrorDetails(undefined as any)).toBe("");
    });

    it("should join DecodingError errors with newlines", () => {
      const details = {
        kind: "DecodingError",
        errors: ["error1", "error2", "error3"],
        status: "600",
      };

      expect(reportIOErrorDetails(details)).toBe("error1\nerror2\nerror3");
    });

    it("should return empty string for DecodingError with no errors", () => {
      const details = {
        kind: "DecodingError",
        errors: [],
        status: "600",
      };

      expect(reportIOErrorDetails(details)).toBe("");
    });

    it("should join CommunicationError meta with newlines", () => {
      const details = {
        kind: "ClientError",
        meta: ["meta1", "meta2"],
        status: "400",
      };

      expect(reportIOErrorDetails(details)).toBe("meta1\nmeta2");
    });

    it("should return empty string for CommunicationError with no meta", () => {
      const details = {
        kind: "ServerError",
        meta: undefined,
        status: "500",
      };

      expect(reportIOErrorDetails(details)).toBe("");
    });
  });

  describe("decodeIOErrorDetails", () => {
    it("should return string array for DecodingError", () => {
      const details = {
        kind: "DecodingError",
        errors: ["err1", "err2"],
        status: "600",
      };

      expect(decodeIOErrorDetails(details)).toEqual(["err1", "err2"]);
    });

    it("should return empty array for DecodingError with no errors", () => {
      const details = {
        kind: "DecodingError",
        errors: [],
        status: "600",
      };

      expect(decodeIOErrorDetails(details)).toEqual([]);
    });

    it("should return string array for CommunicationError with meta", () => {
      const details = {
        kind: "ClientError",
        meta: { reason: "invalid" },
        status: "400",
      };

      expect(decodeIOErrorDetails(details)).toEqual(['{"reason":"invalid"}']);
    });

    it("should return empty array for CommunicationError without meta", () => {
      const details = {
        kind: "ServerError",
        meta: undefined,
        status: "500",
      };

      expect(decodeIOErrorDetails(details)).toEqual([]);
    });

    it("should serialize array meta items", () => {
      const details = {
        kind: "NetworkError",
        meta: ["item1", 42, true],
        status: "500",
      };

      expect(decodeIOErrorDetails(details)).toEqual(["item1", "42", "true"]);
    });

    it("should filter out empty strings but keep serialized null", () => {
      const details = {
        kind: "ClientError",
        meta: ["valid", "", null],
        status: "400",
      };

      expect(decodeIOErrorDetails(details)).toEqual(["valid", "null"]);
    });
  });
});
