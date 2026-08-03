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
  LOCALAI_MODEL: Schema.optional(Schema.String),
  LOCALAI_MAX_RETRIES: Schema.optional(Schema.NumberFromString),
  // Cloudflare Access service token — the LocalAI hostname sits behind a
  // Cloudflare Zero Trust Access application; without these headers every
  // request gets intercepted and answered with an HTML SSO login page
  // instead of reaching LocalAI, which @langchain/openai then silently
  // parses as a completion with zero choices.
  CF_ACCESS_CLIENT_ID: Schema.optional(Schema.String),
  CF_ACCESS_CLIENT_SECRET: Schema.optional(Schema.String),
  API_BASE_URL: Schema.String,
  MCP_URL: Schema.String,
  API_TOKEN: Schema.String,

  // Brave Search
  BRAVE_API_KEY: Schema.String,
  // error tracking
  SENTRY_DSN: Schema.optionalWith(Schema.NullOr(Schema.String), {
    default: () => null,
  }),
}).annotations({ title: "AGENT_ENV" });

type ENV = typeof ENV.Type;

export { ENV };
