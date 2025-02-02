import { BACKEND_ENV, JWT_ENV } from "@liexp/backend/lib/io/ENV.js";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

const ENV = t.intersection(
  [
    BACKEND_ENV,
    t.strict(
      {
        REDIS_CONNECT: BooleanFromString,
        REDIS_HOST: t.string,
      },
      "REDIS_ENV",
    ),
    JWT_ENV,
    t.strict(
      {
        DEBUG: t.string,
        SERVER_HOST: t.string,
        SERVER_PORT: NumberFromString,
        VIRTUAL_PORT: NumberFromString,
        VIRTUAL_HOST: t.string,
        WEB_URL: t.string,
        // geo coding
        GEO_CODE_BASE_URL: t.string,
        GEO_CODE_API_KEY: t.string,
      },
      "API_ENV",
    ),
  ],
  "ENV",
);

type ENV = t.TypeOf<typeof ENV>;

export { ENV };
