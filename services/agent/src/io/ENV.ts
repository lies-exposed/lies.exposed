import { DATABASE_ENV } from "@liexp/backend/lib/io/ENV.js";
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
  LOCALAI_MODEL: Schema.String,
  // Embedding model. Defaults to the gateway alias `localai/embed` (pinned to
  // nomic-embed-text: mem0's pgvector rows live in that space, never repoint).
  LOCALAI_EMBEDDING_MODEL: Schema.optional(Schema.String),
  LOCALAI_MAX_RETRIES: Schema.optional(Schema.NumberFromString),
  // Request timeout for the OpenAI-compatible chat client. The LocalAI
  // gateway serializes/queues incoming requests, so this needs headroom
  // beyond a single model call's latency.
  LOCALAI_TIMEOUT_MS: Schema.optional(Schema.NumberFromString),
  // Max LangGraph steps (model call + tool call = 2 steps) per chat turn before
  // the run is aborted with GraphRecursionError. Defaults to 50.
  AGENT_RECURSION_LIMIT: Schema.optional(Schema.NumberFromString),
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
  // Mem0 persistent memory server URL (optional; if not set, memory features
  // are silently disabled). Points to the mem0 REST API (v3 endpoints).
  MEM0_API_URL: Schema.optional(Schema.String),
}).annotations({ title: "AGENT_ENV" });

type ENV = typeof ENV.Type;

// The HTTP server also persists chat conversations in Postgres (the api service
// owns the schema/migrations). The CLI doesn't need a database, so DB_* lives
// only in the server env.
const SERVER_ENV = Schema.extend(DATABASE_ENV, ENV).annotations({
  title: "AGENT_SERVER_ENV",
});

type SERVER_ENV = typeof SERVER_ENV.Type;

export { ENV, SERVER_ENV };
