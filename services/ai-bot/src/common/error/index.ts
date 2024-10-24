import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type PuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import {
  type APIError,
  decodeIOErrorDetails,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type PDFError } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import * as t from "io-ts";
import { IOError } from "ts-shared/lib/errors.js";

export type AIBotError =
  | DecodeError
  | PuppeteerError
  | PDFError
  | FSError
  | APIError
  | IOError;

export const toAIBotError = (e: unknown): AIBotError => {
  // console.log("Error", e);

  if (e instanceof IOError) {
    // console.log("IOError", e);
    // console.dir(e);
    return e;
  }

  if (e instanceof Error) {
    return new IOError(`${e.name}: ${e.message}`, {
      kind: "ServerError",
      meta: [e.stack ?? ""],
      status: e.name,
    });
  }

  return new IOError("Unknown error", {
    kind: "ServerError",
    meta: [JSON.stringify(e)],
    status: "Unknown Error",
  });
};

export const report = (err: AIBotError): string => {
  // console.log("Name", err.name);
  // console.log("Status", err.status);
  // console.log("Kind", err.details.kind);
  // console.log("Cause", err.cause);

  const parsedError = !err.details
    ? []
    : t.array(t.string).is(err.details)
      ? err.details
      : decodeIOErrorDetails(err.details);

  return `[${err.name}] ${err.message}:\n${parsedError.join("\n")}`;
};
