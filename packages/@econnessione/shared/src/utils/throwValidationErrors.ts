import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

export const throwValidationErrors = (errs: t.Errors): null => {
  // eslint-disable-next-line no-console
  console.log(ThrowReporter.report(E.left(errs)));
  return null;
};
