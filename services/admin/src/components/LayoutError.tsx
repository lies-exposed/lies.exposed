import {
  Error as RaError,
  type ErrorProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as Sentry from "@sentry/react";
import * as React from "react";

/**
 * react-admin's Layout wraps every page in its own error boundary, so render
 * errors never reach the root Sentry.ErrorBoundary. Report them here, then
 * render react-admin's default error page (location-change reset is already
 * handled by the Layout's own Error wrapper).
 */
export const LayoutError: React.FC<ErrorProps> = ({ error, errorInfo }) => {
  // the Layout stores errorInfo from its onError callback, so it is only
  // available on the second render: wait for it to keep the component stack
  React.useEffect(() => {
    if (!errorInfo) return;
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }, [error, errorInfo]);

  return (
    <RaError
      error={error}
      errorInfo={errorInfo}
      resetErrorBoundary={() => {}}
    />
  );
};
