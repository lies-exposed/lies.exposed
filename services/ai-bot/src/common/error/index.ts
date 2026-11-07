import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type PuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { APIError } from "@liexp/io/lib/http/Error/APIError.js";
import { type DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { IOErrorSchema } from "@liexp/io/lib/http/Error/IOError.js";
import { type PDFError } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { decodeIOErrorDetails } from "@liexp/shared/lib/utils/APIError.utils.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";

export type AIBotError =
  DecodeError | PuppeteerError | PDFError | FSError | APIError | IOError;

export const toAIBotError = (e: unknown): AIBotError => {
  // Check instanceof first — faster and more reliable than schema decode.
  if (e instanceof IOError) {
    return e;
  }

  // Fallback for cross-module-boundary cases where instanceof fails.
  if (Schema.is(IOErrorSchema)(e)) {
    return e as IOError;
  }

  // APIError is a plain schema-validated object (e.g. HTTP response from the API
  // service) — it is not an IOError subclass, so check it separately.
  if (Schema.is(APIError)(e)) {
    return e;
  }

  if (e instanceof Error) {
    return new IOError(`${e.name}: ${e.message}`, {
      kind: "ServerError",
      meta: [e.stack ?? ""],
      status: "500",
    });
  }

  return new IOError("Unknown error", {
    kind: "ServerError",
    meta: [JSON.stringify(e)],
    status: "500",
  });
};

export const report = (err: AIBotError): string => {
  const parsedError = !err.details
    ? []
    : Schema.is(Schema.Array(Schema.String))(err.details)
      ? err.details
      : decodeIOErrorDetails(err.details);

  return `[${err.name}] ${err.message} (${err.status}):\n${parsedError.join("\n")}`;
};

/**
 * Plain, JSON-safe representation of an error to store on `queue.error`.
 *
 * Error instances keep `message`/`stack` as non-enumerable properties, so
 * persisting the instance as-is (`error: e`) loses exactly the information
 * needed to debug a failed job.
 */
export interface JobError {
  name: string;
  message: string;
  status: string | null;
  details: string[];
  failedAt: string;
}

export const toJobError = (e: unknown): JobError => {
  const err = toAIBotError(e);
  const details = !err.details
    ? []
    : Schema.is(Schema.Array(Schema.String))(err.details)
      ? err.details
      : decodeIOErrorDetails(err.details);

  return {
    name: err.name || "Error",
    message: err.message || "Unknown error",
    status: err.status ? String(err.status) : null,
    // Stack traces can be long: keep the first lines, enough to locate the
    // failure without bloating the queue row.
    details: details.map((d) => d.split("\n").slice(0, 15).join("\n")),
    failedAt: new Date().toISOString(),
  };
};
