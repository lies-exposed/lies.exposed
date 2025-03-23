import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import { pipe, Schema } from "effect";

export const JWT_ENV = Schema.Struct({
  JWT_SECRET: Schema.String,
}).annotations({
  title: "JWT_ENV",
});

export type JWT_ENV = typeof JWT_ENV.Type;

export const DATABASE_ENV = pipe(
  Schema.Struct({
    DB_USERNAME: Schema.String,
    DB_PASSWORD: Schema.String,
    DB_HOST: Schema.String,
    DB_PORT: Schema.NumberFromString,
    DB_DATABASE: Schema.String,
  }).annotations({
    title: "DATABASE_ENV",
  }),
  (schema) =>
    Schema.extend(
      schema,
      Schema.Union(
        Schema.Struct({
          DB_SSL_MODE: Schema.Literal("require"),
          DB_SSL_CERT_PATH: Schema.String,
        }).annotations({
          title: "DB_SSL_REQUIRE",
        }),
        Schema.Struct({
          DB_SSL_MODE: Schema.Literal("off"),
        }).annotations({
          title: "DB_SSL_OFF",
        }),
      ),
    ).annotations({
      title: "DB_ENV",
    }),
).annotations({
  title: "DB_ENV",
});

export type DATABASE_ENV = typeof DATABASE_ENV.Type;

export const SPACE_ENV = Schema.Struct({
  // SPACES
  SPACE_BUCKET: Schema.String,
  SPACE_ENDPOINT: Schema.String,
  SPACE_REGION: Schema.String,
  SPACE_ACCESS_KEY_ID: Schema.String,
  SPACE_ACCESS_KEY_SECRET: Schema.String,
}).annotations({
  title: "SPACE_ENV",
});
export type SPACE_ENV = typeof SPACE_ENV.Type;

export const TG_BOT_ENV = Schema.Struct({
  TG_BOT_TOKEN: Schema.String,
  TG_BOT_USERNAME: Schema.String,
  TG_BOT_CHAT: Schema.String,
}).annotations({
  title: "TG_BOT_ENV",
});
export type TG_BOT_ENV = typeof TG_BOT_ENV.Type;

export const BACKEND_ENV = pipe(
  Schema.Struct({
    NODE_ENV,
    DEFAULT_PAGE_SIZE: Schema.NumberFromString,
  }).annotations({
    title: "BACKEND_ENV",
  }),
  (schema) => Schema.extend(schema, DATABASE_ENV),
  (schema) => Schema.extend(schema, SPACE_ENV),
);

export type BACKEND_ENV = typeof BACKEND_ENV.Type;
