import { BACKEND_ENV } from "@liexp/backend/lib/io/ENV.js";
import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";

const CRON_ENVS = t.strict(
  {
    GENERATE_MISSING_THUMBNAILS_CRON: t.string,
    TEMP_FOLDER_CLEAN_UP_CRON: t.string,
    SOCIAL_POSTING_CRON: t.string,
    PROCESS_DONE_JOB_CRON: t.string,
    REGENERATE_MEDIA_THUMBNAILS_CRON: t.string,
    UPSERT_NLP_ENTITIES_CRON: t.string,
  },
  "CRON_ENVS",
);

const SERVICES_ENVS = t.intersection(
  [
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
    t.strict(
      {
        REDIS_HOST: t.string,
        REDIS_CONNECT: BooleanFromString,
      },
      "REDIS_ENV",
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
  ],
  "SERVICES_ENVS",
);

export const ENV = t.intersection([
  t.strict(
    {
      NODE_ENV,
      DEBUG: t.string,
      WEB_URL: t.string,
    },
    "ENV",
  ),
  BACKEND_ENV,
  SERVICES_ENVS,
  CRON_ENVS,
]);
export type ENV = t.TypeOf<typeof ENV>;
