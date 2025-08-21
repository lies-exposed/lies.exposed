import { BACKEND_ENV, SPACE_ENV } from "@liexp/backend/lib/io/ENV.js";
import { Schema } from "effect";

const CRON_ENVS = Schema.Struct({
  GENERATE_MISSING_THUMBNAILS_CRON: Schema.String,
  TEMP_FOLDER_CLEAN_UP_CRON: Schema.String,
  SOCIAL_POSTING_CRON: Schema.String,
  PROCESS_DONE_JOB_CRON: Schema.String,
  REGENERATE_MEDIA_THUMBNAILS_CRON: Schema.String,
  UPSERT_NLP_ENTITIES_CRON: Schema.String,
}).annotations({ title: "CRON_ENVS" });

const REDIS_ENVS = Schema.Struct({
  REDIS_HOST: Schema.String,
  REDIS_CONNECT: Schema.BooleanFromString,
}).annotations({
  title: "REDIS_ENV",
});

const TG_BOT_ENVS = Schema.Struct({
  TG_BOT_TOKEN: Schema.String,
  TG_BOT_CHAT: Schema.String,
  TG_BOT_USERNAME: Schema.String,
  TG_BOT_POLLING: Schema.BooleanFromString,
  TG_BOT_BASE_API_URL: Schema.String,
  IG_USERNAME: Schema.String,
  IG_PASSWORD: Schema.String,
}).annotations({
  title: "TG_BOT_ENV",
});

const GEO_CODE_ENVS = Schema.Struct({
  GEO_CODE_BASE_URL: Schema.String,
  GEO_CODE_API_KEY: Schema.String,
}).annotations({ title: "GEO_CODE_ENV" });

const SERVICES_ENVS = Schema.Struct({
  ...REDIS_ENVS.fields,
  ...TG_BOT_ENVS.fields,
  ...SPACE_ENV.fields,
  ...GEO_CODE_ENVS.fields,
}).annotations({
  title: "SERVICES_ENVS",
});

export const ENV = Schema.extend(
  BACKEND_ENV,
  Schema.Struct({
    WEB_URL: Schema.String,
    ...SERVICES_ENVS.fields,
    ...CRON_ENVS.fields,
  }),
).annotations({
  title: "ENV",
});

export type ENV = typeof ENV.Type;
