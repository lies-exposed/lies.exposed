import { fp } from "@liexp/core";
import {
  APIError,
  type APIStatusCode,
} from "@liexp/io/lib/http/Error/APIError.js";
import { IOErrorSchema } from "@liexp/io/lib/http/Error/IOError.js";
import { IOError, type IOErrorDetails } from "@ts-endpoint/core";
import { Schema } from "effect/index";
import { pipe } from "fp-ts/lib/function";

export const decodeIOErrorDetails = (
  details: IOErrorDetails<any>,
): string[] => {
  return details.kind === "ServerError"
    ? (details.meta as string[])
    : details.kind === "DecodingError"
      ? (details.errors as string[])
      : [];
};

/**
 * Maps IOError status to valid APIStatusCode.
 * Handles special cases like DecodingError (600 -> 400).
 */
const mapStatusToAPIStatusCode = (
  status: number,
  kind: string,
): APIStatusCode => {
  // DecodingError uses internal status 600, map to 400 Bad Request
  if (kind === "DecodingError") {
    return 400;
  }
  // Valid status codes pass through (regardless of kind)
  if ([200, 201, 400, 401, 404, 500].includes(status)) {
    return status as APIStatusCode;
  }
  // NetworkError without valid status maps to 500
  if (kind === "NetworkError") {
    return 500;
  }
  // Fallback to 500 for unknown status
  return 500;
};

/**
 * Extracts details array from IOError based on its kind.
 */
const extractDetails = (e: IOError): string[] | undefined => {
  const { details } = e;

  if (details.kind === "DecodingError") {
    if (!details.errors) return undefined;
    return Array.isArray(details.errors)
      ? details.errors.map(String)
      : [String(details.errors)];
  }

  // ClientError, ServerError, NetworkError, KnownError
  if (details.meta === undefined) return undefined;
  return Array.isArray(details.meta)
    ? details.meta.map(String).filter(Boolean)
    : [reportIOErrorDetails(details)];
};

export const fromIOError = (e: IOError): APIError => {
  return {
    status: mapStatusToAPIStatusCode(e.status, e.details.kind),
    name: "APIError",
    message: e.message,
    details: extractDetails(e),
  };
};

/**
 * Converts any error to an APIError for HTTP response.
 * Uses schema validation for IOError detection (more robust than instanceof).
 */
export const toAPIError = (e: unknown): APIError => {
  // Already an APIError
  if (Schema.is(APIError)(e)) {
    return e;
  }

  // Handle IOError and all subclasses via instanceof (works when same module)
  if (e instanceof IOError) {
    return fromIOError(e);
  }

  // Handle IOError-like objects via schema validation (works across module boundaries)
  if (Schema.is(IOErrorSchema)(e)) {
    return fromIOError(e as IOError);
  }

  // Handle generic Error instances
  if (e instanceof Error) {
    return {
      message: e.message,
      name: "APIError",
      details: e.stack ? [e.stack] : undefined,
      status: 500,
    };
  }

  // Try to decode as APIError or fall back to unknown error
  return pipe(
    e,
    Schema.decodeUnknownEither(APIError),
    fp.E.getOrElse(
      (): APIError => ({
        message: "Unknown error",
        name: "APIError",
        details: [JSON.stringify(e)],
        status: 500,
      }),
    ),
  );
};

export const reportIOErrorDetails = (details: IOErrorDetails<any>): string => {
  const parsedError = !details
    ? []
    : Schema.is(Schema.Array(Schema.String))(details)
      ? (details as unknown as string[])
      : decodeIOErrorDetails(details);

  return parsedError.join("\n");
};
