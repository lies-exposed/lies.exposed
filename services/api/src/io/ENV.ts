import { BACKEND_ENV, JWT_ENV } from "@liexp/backend/lib/io/ENV.js";
import { Schema } from "effect";

const ENV = Schema.extend(
  BACKEND_ENV,
  Schema.Struct({
    ...JWT_ENV.fields,
    REDIS_CONNECT: Schema.BooleanFromString,
    REDIS_HOST: Schema.String,
    DEBUG: Schema.String,
    SERVER_HOST: Schema.String,
    SERVER_PORT: Schema.NumberFromString,
    VIRTUAL_PORT: Schema.NumberFromString,
    VIRTUAL_HOST: Schema.String,
    WEB_URL: Schema.String,
    // geo coding
    GEO_CODE_BASE_URL: Schema.String,
    GEO_CODE_API_KEY: Schema.String,
  }).annotations({ title: "API_ENV" }),
);
type ENV = typeof ENV.Type;

export { ENV };
