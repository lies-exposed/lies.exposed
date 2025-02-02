import { fp } from "@liexp/core/lib/fp/index.js";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-io-error";

export class _DecodeError extends IOError {
  status: number = 400;
}

export const DecodeError = {
  of: (message: string, errors: t.Errors): _DecodeError => {
    return new _DecodeError(message, {
      kind: "DecodingError",
      errors: PathReporter.report(fp.E.left(errors)),
    });
  },
};
