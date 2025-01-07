import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

export const DATABASE_ENV = t.intersection(
  [
    t.strict(
      {
        DB_USERNAME: t.string,
        DB_PASSWORD: t.string,
        DB_HOST: t.string,
        DB_PORT: NumberFromString,
        DB_DATABASE: t.string,
      },
      "DATABASE_ENV",
    ),
    t.union([
      t.strict({
        DB_SSL_MODE: t.literal("require"),
        DB_SSL_CERT_PATH: t.string,
      }),
      t.strict({
        DB_SSL_MODE: t.literal("off"),
      }),
    ]),
  ],
  "DB_ENV",
);
export type DATABASE_ENV = t.TypeOf<typeof DATABASE_ENV>;

export const SPACE_ENV = t.strict(
  {
    // SPACES
    SPACE_BUCKET: t.string,
    SPACE_ENDPOINT: t.string,
    SPACE_REGION: t.string,
    SPACE_ACCESS_KEY_ID: t.string,
    SPACE_ACCESS_KEY_SECRET: t.string,
  },
  "SPACE_ENV",
);
export type SPACE_ENV = t.TypeOf<typeof SPACE_ENV>;

export const TG_BOT_ENV = t.strict(
  { TG_BOT_TOKEN: t.string, TG_BOT_USERNAME: t.string, TG_BOT_CHAT: t.string },
  "TG_BOT_ENV",
);
export type TG_BOT_ENV = t.TypeOf<typeof TG_BOT_ENV>;

export const BACKEND_ENV = t.intersection(
  [
    t.strict({ NODE_ENV, DEFAULT_PAGE_SIZE: NumberFromString }),
    DATABASE_ENV,
    SPACE_ENV,
    TG_BOT_ENV,
  ],
  "BACKEND_ENV",
);
export type BACKEND_ENV = t.TypeOf<typeof BACKEND_ENV>;
