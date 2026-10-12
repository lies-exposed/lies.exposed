import type * as React from "react";

/**
 * `onError` handler for nested `react-error-boundary` boundaries.
 *
 * A boundary that renders a fallback swallows the error, so neither the root
 * Sentry.ErrorBoundary nor Sentry's global handlers ever see it. `reportError`
 * dispatches it as a window `error` event, which Sentry's default
 * GlobalHandlers integration captures — keeping this package free of a
 * Sentry dependency.
 */
export const reportBoundaryError = (
  error: unknown,
  _info: React.ErrorInfo,
): void => {
  if (typeof globalThis.reportError === "function") {
    globalThis.reportError(error);
  }
};
