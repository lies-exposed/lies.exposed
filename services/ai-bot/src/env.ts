import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { optionFromUndefined } from "@liexp/shared/lib/io/Common/optionFromUndefined.js";
import { type Either } from "fp-ts/lib/Either.js";
import * as t from "io-ts";

const ENV = t.strict(
  {
    API_URL: t.string,
    LOCALAI_URL: t.string,
    LIEXP_USERNAME: optionFromUndefined(t.string),
    LIEXP_PASSWORD: optionFromUndefined(t.string),
  },
  "ENV",
);
type ENV = t.TypeOf<typeof ENV>;

const parseENV = (env: unknown): Either<any, ENV> => {
  return pipe(
    ENV.decode(env),
    fp.E.mapLeft((e) => e),
  );
};

export { ENV, parseENV };
