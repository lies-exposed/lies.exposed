import * as Sentry from "@sentry/node";
import { IOError } from "@ts-endpoint/core";
import * as IOE from "fp-ts/lib/IOEither.js";
import { ServerError } from "../errors/ServerError.js";

export interface SentryOptions {
  /**
   * HTTP status codes (as strings) to discard from error reporting.
   * Defaults to 401 and 404.
   */
  ignoredStatuses?: string[];
}

/**
 * Initializes Sentry error tracking if a DSN is provided.
 * Automatically filters out client errors (401, 404 by default) via `beforeSend`.
 * Returns an IOEither so it can be composed into the service startup pipe.
 */
export const initSentry = (
  dsn: string | null | undefined,
  options: SentryOptions = {},
): IOE.IOEither<ServerError, void> =>
  IOE.tryCatch(
    () => {
      if (!dsn) return;

      const ignoredStatuses = options.ignoredStatuses ?? ["401", "404"];

      Sentry.init({
        dsn,
        integrations: [],
        tracesSampleRate: 0,
        beforeSend(event, hint) {
          const err = hint?.originalException;
          if (err instanceof IOError && "status" in err.details) {
            if (ignoredStatuses.includes(err.details.status)) return null;
          }
          return event;
        },
      });
    },
    ServerError.fromUnknown,
  );

export { Sentry };
