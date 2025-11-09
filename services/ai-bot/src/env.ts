import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { OptionFromNullishToNull } from "@liexp/shared/lib/io/http/Common/OptionFromNullishToNull.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import { type Either } from "fp-ts/lib/Either.js";
import { type AIBotError } from "#common/error/index.js";

const ENV = Schema.Struct({
  NODE_ENV,
  DEBUG: OptionFromNullishToNull(Schema.String),
  API_TOKEN: OptionFromNullishToNull(Schema.String),
  AGENT_API_URL: OptionFromNullishToNull(Schema.String),
  AGENT_MODEL: OptionFromNullishToNull(Schema.String),
  AGENT_API_KEY: Schema.String,
  AGENT_TIMEOUT: OptionFromNullishToNull(Schema.NumberFromString),
  CF_ACCESS_CLIENT_ID: OptionFromNullishToNull(Schema.String),
  CF_ACCESS_CLIENT_SECRET: OptionFromNullishToNull(Schema.String),
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
