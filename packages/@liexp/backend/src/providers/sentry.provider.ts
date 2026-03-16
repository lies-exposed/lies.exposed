import * as Sentry from "@sentry/node";
import { IOError } from "@ts-endpoint/core";

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
 * Call this once at service startup, before any other code runs.
 */
export const initSentry = (
  dsn: string | null | undefined,
  options: SentryOptions = {},
): void => {
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
};

export { Sentry };
