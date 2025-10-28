import { Schema } from "effect";

const ENV = Schema.Struct({
  NODE_ENV: Schema.String,
  DEBUG: Schema.String,
  SERVER_HOST: Schema.String,
  SERVER_PORT: Schema.NumberFromString,
  // LocalAI configuration
  LOCALAI_BASE_URL: Schema.String,
  LOCALAI_MODEL: Schema.String,
  LOCALAI_API_KEY: Schema.String,
  // API service configuration
  API_BASE_URL: Schema.optional(Schema.String),
  API_TOKEN: Schema.String,
}).annotations({ title: "AGENT_ENV" });

type ENV = typeof ENV.Type;

export { ENV };
