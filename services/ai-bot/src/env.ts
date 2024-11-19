import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { optionFromUndefined } from "@liexp/shared/lib/io/Common/optionFromUndefined.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type Either } from "fp-ts/lib/Either.js";
import * as t from "io-ts";
import { type AIBotError } from "#common/error/index.js";

const ENV = t.strict(
  {
    LIEXP_USERNAME: optionFromUndefined(t.string),
    LIEXP_PASSWORD: optionFromUndefined(t.string),
  },
  "ENV",
);
type ENV = t.TypeOf<typeof ENV>;

const parseENV = (env: unknown): Either<AIBotError, ENV> => {
  return pipe(
    ENV.decode(env),
    fp.E.mapLeft((e) => DecodeError.of("Failed to parse process.env", e)),
  );
};

export { ENV, parseENV };
