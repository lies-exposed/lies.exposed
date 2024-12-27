import { BACKEND_ENV, DATABASE_ENV } from "@liexp/backend/lib/io/ENV.js";
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
          PROCESS_DONE_JOB_CRON: t.string,
          REGENERATE_MEDIA_THUMBNAILS_CRON: t.string,
          // unused
          DOWNLOAD_VACCINE_DATA_CRON: t.string,
          // geo coding
          GEO_CODE_BASE_URL: t.string,
          GEO_CODE_API_KEY: t.string,
        },
        "API_ENV",
      ),
      t.strict(
        {
          OPENAI_URL: t.string,
        },
        "OPENAI_ENV",
      ),
    ]),
    DATABASE_ENV,
  ],
  "ENV",
);

type ENV = t.TypeOf<typeof ENV>;

export { ENV };
