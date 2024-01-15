import type * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";

export const throwValidationErrors = (errs: t.Errors): null => {
  // eslint-disable-next-line no-console
  console.log(failure(errs));
  return null;
};
