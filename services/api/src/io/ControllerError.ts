/**
 * Re-exports from @liexp/backend so all services share the same implementation.
 * Internal consumers continue to import from this path without change.
 */
export {
  toControllerError,
  report,
} from "@liexp/backend/lib/express/middleware/error.middleware.js";
export { IOError as ControllerError } from "@ts-endpoint/core";
