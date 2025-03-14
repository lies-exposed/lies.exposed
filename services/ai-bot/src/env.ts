import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import { type Either } from "fp-ts/lib/Either.js";
import { type AIBotError } from "#common/error/index.js";

const ENV = Schema.Struct({
  LIEXP_USERNAME: Schema.Option(Schema.String),
  LIEXP_PASSWORD: Schema.Option(Schema.String),
  DEBUG: Schema.Option(Schema.String),
}).annotations({
  title: "ENV",
});
type ENV = typeof ENV.Type;

const parseENV = (env: unknown): Either<AIBotError, ENV> => {
  return pipe(
    env,
    Schema.decodeUnknownEither(ENV),
    fp.E.mapLeft((e) => DecodeError.of("Failed to parse process.env", e)),
  );
};

export { ENV, parseENV };
