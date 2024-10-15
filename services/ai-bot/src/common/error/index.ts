import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type PuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type PDFError } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { IOError } from "ts-shared/lib/errors.js";

export type ApiBotError =
  | PuppeteerError
  | PDFError
  | FSError
  | APIError
  | IOError;

export const toApiBotError = (e: unknown): ApiBotError => {
  if (e instanceof IOError) {
    return e;
  }

  return new IOError("Unknown error", {
    kind: "ServerError",
    meta: [e, JSON.stringify(e)],
    status: "Unknown Error",
  });
};
