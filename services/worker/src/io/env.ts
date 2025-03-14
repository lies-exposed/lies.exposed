import { BACKEND_ENV } from "@liexp/backend/lib/io/ENV.js";
import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import { pipe, Schema } from "effect";

const CRON_ENVS = Schema.Struct({
  GENERATE_MISSING_THUMBNAILS_CRON: Schema.String,
  TEMP_FOLDER_CLEAN_UP_CRON: Schema.String,
  SOCIAL_POSTING_CRON: Schema.String,
  PROCESS_DONE_JOB_CRON: Schema.String,
  REGENERATE_MEDIA_THUMBNAILS_CRON: Schema.String,
  UPSERT_NLP_ENTITIES_CRON: Schema.String,
}).annotations({ title: "CRON_ENVS" });

const SERVICES_ENVS = pipe(
  Schema.Struct({
    TG_BOT_TOKEN: Schema.String,
    TG_BOT_CHAT: Schema.String,
    TG_BOT_USERNAME: Schema.String,
    TG_BOT_POLLING: Schema.BooleanFromString,
    TG_BOT_BASE_API_URL: Schema.String,
    IG_USERNAME: Schema.String,
    IG_PASSWORD: Schema.String,
  }).annotations({
    title: "TG_BOT_ENV",
  }),
  (schema) =>
    Schema.extend(
      schema,
      Schema.Struct({
        REDIS_HOST: Schema.String,
        REDIS_CONNECT: Schema.BooleanFromString,
      }).annotations({
        title: "REDIS_ENV",
      }),
    ),
  (schema) =>
    Schema.extend(
      schema,
      Schema.Struct({
        // SPACES
        SPACE_BUCKET: Schema.String,
        SPACE_ENDPOINT: Schema.String,
        SPACE_REGION: Schema.String,
        SPACE_ACCESS_KEY_ID: Schema.String,
        SPACE_ACCESS_KEY_SECRET: Schema.String,
      }).annotations({ title: "SPACE_ENV" }),
    ),
  (schema) =>
    Schema.extend(
      schema,
      Schema.Struct({
        GEO_CODE_BASE_URL: Schema.String,
        GEO_CODE_API_KEY: Schema.String,
      }).annotations({ title: "GEO_CODE_ENV" }),
    ).annotations({
      title: "SERVICES_ENVS",
    }),
);

export const ENV = pipe(
  Schema.extend(
    Schema.Struct({
      NODE_ENV,
      DEBUG: Schema.String,
      WEB_URL: Schema.String,
    }).annotations({
      title: "ENV",
    }),
    BACKEND_ENV,
  ),
  (schema) => Schema.extend(schema, SERVICES_ENVS),
  (schema) => Schema.extend(schema, CRON_ENVS),
);
export type ENV = typeof ENV.Type;
