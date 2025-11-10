import { AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { Schema } from "effect";

const ENV = Schema.Struct({
  NODE_ENV: Schema.String,
  DEBUG: Schema.String,
  SERVER_HOST: Schema.String,
  SERVER_PORT: Schema.NumberFromString,
  // JWT configuration for M2M authentication
  JWT_SECRET: Schema.String,
  // LocalAI configuration
  LOCALAI_BASE_URL: Schema.String,
  LOCALAI_MODEL: AvailableModels,
  LOCALAI_API_KEY: Schema.String,
  LOCALAI_MAX_RETRIES: Schema.optional(Schema.NumberFromString),
  // TODO: extract this to a proper schema
  AI_PROVIDER: Schema.Union(Schema.Literal("openai"), Schema.Literal("xai")),
  // API service configuration
  API_BASE_URL: Schema.optional(Schema.String),
  API_TOKEN: Schema.String,
}).annotations({ title: "AGENT_ENV" });

type ENV = typeof ENV.Type;

export { ENV };
