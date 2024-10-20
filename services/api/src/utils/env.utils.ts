import { fp } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";
import { ENV } from "#io/ENV.js";

export const parseENV = (env: unknown): Either<ControllerError, ENV> => {
  return pipe(
    ENV.decode(env),
    fp.E.mapLeft((e) => DecodeError(`Failed to decode process env`, e)),
  );
};
