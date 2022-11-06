import * as t from "io-ts";
import { BooleanFromString } from 'io-ts-types/lib/BooleanFromString';
import { NumberFromString } from "io-ts-types/lib/NumberFromString";

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
const TEST = t.literal("test");

// const NODE_ENV = t.union(
//   [TEST, DEVELOPMENT, PRODUCTION],
//   "NODE_ENV"
// );

const ENV = t.intersection(
  [
    t.union(
      [
        t.strict({
          NODE_ENV: t.union([DEVELOPMENT, TEST]),
          DEV_DATA_HOST: t.string,
        }),
        t.strict({
          NODE_ENV: PRODUCTION,
        }),
      ],
      "NODE_ENV"
    ),
    t.strict(
      {
        DEBUG: t.string,
        API_PORT: NumberFromString,
        API_HOST: t.string,
        DEFAULT_PAGE_SIZE: NumberFromString,
        JWT_SECRET: t.string,
        DOWNLOAD_VACCINE_DATA_CRON: t.string,
        WEB_URL: t.string,
      },
      "API_ENV"
    ),
    t.strict(
      {
        // SPACES
        SPACE_BUCKET: t.string,
        SPACE_REGION: t.string,
        SPACE_ACCESS_KEY_ID: t.string,
        SPACE_ACCESS_KEY_SECRET: t.string,
      },
      "SPACE_ENV"
    ),
    t.intersection(
      [
        t.strict(
          {
            DB_USERNAME: t.string,
            DB_PASSWORD: t.string,
            DB_HOST: t.string,
            DB_PORT: NumberFromString,
            DB_DATABASE: t.string,
          },
          "DB_BASE_ENV"
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
      "DB_ENV"
    ),
    t.strict(
      {
        TG_BOT_TOKEN: t.string,
        TG_BOT_CHAT: t.string,
        TG_BOT_POLLING: BooleanFromString
      },
      "TG_BOT_ENV"
    ),
  ],
  "ENV"
);

type ENV = t.TypeOf<typeof ENV>;

export { ENV };
