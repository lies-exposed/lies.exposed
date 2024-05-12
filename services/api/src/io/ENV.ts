import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

const ENV = t.intersection(
  [
    t.union(
      [
        t.strict({
          NODE_ENV: t.union([NODE_ENV.types[0], NODE_ENV.types[1]]),
          DOWNLOAD_VACCINE_DATA_CRON: t.string,
        }),
        t.strict({
          NODE_ENV: NODE_ENV.types[2],
        }),
      ],
      "NODE_ENV",
    ),
    t.intersection([
      t.strict(
        {
          DEBUG: t.string,
          SERVER_HOST: t.string,
          SERVER_PORT: NumberFromString,
          VIRTUAL_PORT: NumberFromString,
          VIRTUAL_HOST: t.string,
          DEFAULT_PAGE_SIZE: NumberFromString,
          JWT_SECRET: t.string,
          WEB_URL: t.string,
          // crons
          SOCIAL_POSTING_CRON: t.string,
          TEMP_FOLDER_CLEAN_UP_CRON: t.string,
          GENERATE_MISSING_THUMBNAILS_CRON: t.string,
        },
        "API_ENV",
      ),
      t.strict(
        {
          // SPACES
          SPACE_BUCKET: t.string,
          SPACE_ENDPOINT: t.string,
          SPACE_REGION: t.string,
          SPACE_ACCESS_KEY_ID: t.string,
          SPACE_ACCESS_KEY_SECRET: t.string,
        },
        "SPACE_ENV",
      ),
      t.strict(
        {
          GEO_CODE_BASE_URL: t.string,
          GEO_CODE_API_KEY: t.string,
        },
        "GEO_CODE_ENV",
      ),
      t.strict(
        {
          PRIVATE_GPT_ENVIRONMENT: t.string,
        },
        "PRIVATE_GPT_ENV",
      ),
    ]),
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
          "DB_BASE_ENV",
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
    ),
    t.strict(
      {
        TG_BOT_TOKEN: t.string,
        TG_BOT_CHAT: t.string,
        TG_BOT_USERNAME: t.string,
        TG_BOT_POLLING: BooleanFromString,
        TG_BOT_BASE_API_URL: t.string,
        IG_USERNAME: t.string,
        IG_PASSWORD: t.string,
      },
      "TG_BOT_ENV",
    ),
  ],
  "ENV",
);

type ENV = t.TypeOf<typeof ENV>;

export { ENV };
