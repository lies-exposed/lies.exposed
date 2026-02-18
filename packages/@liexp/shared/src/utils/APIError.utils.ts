import { fp } from "@liexp/core";
import {
  APIError,
  type APIStatusCode,
} from "@liexp/io/lib/http/Error/APIError.js";
import { IOErrorSchema } from "@liexp/io/lib/http/Error/IOError.js";
import {
  IOError,
  type IOErrorDetails,
  type CommunicationError,
  type DecodingError,
  type KnownError,
} from "@ts-endpoint/core";
import { Schema } from "effect/index";
import { pipe } from "fp-ts/lib/function.js";

type ErrorKind = DecodingError | CommunicationError | KnownError;

const serializeMeta = (v: unknown): string =>
  typeof v === "string" ? v : JSON.stringify(v);

/**
 * Converts IOErrorDetails to a string array, or undefined when there are no
 * meaningful details to surface.
 *
 * - DecodingError: uses String() to preserve Effect ParseError formatting.
 * - ClientError / ServerError / NetworkError / KnownError: serialises meta
 *   values with JSON.stringify so structured objects are not lost as
 *   "[object Object]".
 */
const detailsToStrings = (
  details: IOErrorDetails<any>,
): string[] | undefined => {
  if (details.kind === "DecodingError") {
    return details.errors.length > 0 ? details.errors.map(String) : undefined;
  }

  // CommunicationError (ClientError / ServerError / NetworkError) and KnownError
  const meta = (details as { meta?: unknown }).meta;
  if (meta === undefined || meta === null) return undefined;
  return Array.isArray(meta)
    ? meta.map(serializeMeta).filter(Boolean)
    : [serializeMeta(meta)];
};

/**
 * Maps an IOError's numeric status and kind to a valid APIStatusCode.
 * DecodingError uses the internal sentinel 600 — that is mapped to 400.
 */
const mapStatusToAPIStatusCode = (
  status: number,
  kind: ErrorKind,
): APIStatusCode => {
  if (kind === "DecodingError") return 400;
  if (([200, 201, 400, 401, 403, 404, 500] as number[]).includes(status)) {
    return status as APIStatusCode;
  }
  return 500;
};

export const fromIOError = (e: IOError): APIError => {
  return {
    status: mapStatusToAPIStatusCode(e.status, e.details.kind as ErrorKind),
    name: "APIError",
    message: e.message,
    details: detailsToStrings(e.details),
  };
};

/**
 * Converts any unknown error to an APIError for HTTP response.
 * Handles IOError instances, IOError-shaped plain objects (cross-module boundary
 * fallback), generic Errors, and unknown values.
 */
export const toAPIError = (e: unknown): APIError => {
  if (Schema.is(APIError)(e)) return e;

  if (e instanceof IOError) return fromIOError(e);

  // Fallback for cross-module boundary: instanceof may fail when the same
  // package is loaded twice; schema validation catches those cases.
  if (Schema.is(IOErrorSchema)(e)) return fromIOError(e as IOError);

  if (e instanceof Error) {
    return {
      message: e.message,
      name: "APIError",
      details: e.stack ? [e.stack] : undefined,
      status: 500,
    };
  }

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

/**
 * Formats IOErrorDetails as a single newline-separated string for logging.
 */
export const reportIOErrorDetails = (details: IOErrorDetails<any>): string => {
  if (!details) return "";
  return (detailsToStrings(details) ?? []).join("\n");
};

/**
 * Decodes IOErrorDetails to a string array.
 * Handles all error kinds: DecodingError, ClientError, ServerError, NetworkError.
 */
export const decodeIOErrorDetails = (
  details: IOErrorDetails<any>,
): string[] => {
  return detailsToStrings(details) ?? [];
};
