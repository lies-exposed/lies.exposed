import { BACKEND_ENV, JWT_ENV } from "@liexp/backend/lib/io/ENV.js";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

const ENV = t.intersection(
  [
    BACKEND_ENV,
    Schema.Struct(
      {
        REDIS_CONNECT: BooleanFromString,
        REDIS_HOST: Schema.String,
      },
      "REDIS_ENV",
    ),
    JWT_ENV,
    Schema.Struct(
      {
        DEBUG: Schema.String,
        SERVER_HOST: Schema.String,
        SERVER_PORT: NumberFromString,
        VIRTUAL_PORT: NumberFromString,
        VIRTUAL_HOST: Schema.String,
        WEB_URL: Schema.String,
        // geo coding
        GEO_CODE_BASE_URL: Schema.String,
        GEO_CODE_API_KEY: Schema.String,
      },
      "API_ENV",
    ),
  ],
  "ENV",
);

type ENV = t.TypeOf<typeof ENV>;

export { ENV };
