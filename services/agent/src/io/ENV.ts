import { Schema } from "effect";

const ENV = Schema.Struct({
  NODE_ENV: Schema.String,
  DEBUG: Schema.String,
  SERVER_HOST: Schema.String,
  SERVER_PORT: Schema.NumberFromString,
  // JWT configuration for M2M authentication
  JWT_SECRET: Schema.String,
  // AI Provider API Keys - all optional, enabled based on which keys are configured
  OPENAI_BASE_URL: Schema.optional(Schema.String),
  OPENAI_API_KEY: Schema.optional(Schema.String),
  XAI_API_KEY: Schema.optional(Schema.String),
  ANTHROPIC_API_KEY: Schema.optional(Schema.String),
  LOCALAI_MAX_RETRIES: Schema.optional(Schema.NumberFromString),
  API_BASE_URL: Schema.optional(Schema.String),
  API_TOKEN: Schema.String,

  // Brave Search
  BRAVE_API_KEY: Schema.String,
}).annotations({ title: "AGENT_ENV" });

type ENV = typeof ENV.Type;

export { ENV };
