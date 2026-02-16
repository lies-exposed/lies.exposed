import { type JWTProviderContext } from "@liexp/backend/lib/context/jwt.context.js";
import { type LangchainContext } from "@liexp/backend/lib/context/langchain.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { type ProviderConfigOverride } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { type AgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type ENV } from "#io/ENV.js";

interface ENVContext {
  env: ENV;
}

interface HTTPProviderContext {
  http: HTTPProvider;
}

interface AgentProviderContext {
  agent: AgentProvider;
}

/**
 * Agent factory for creating agents on-demand with provider overrides
 * If no override provided, uses the default agent from AgentProvider
 */
interface AgentFactoryContext {
  agentFactory: (
    override?: ProviderConfigOverride,
  ) => TaskEither<ServerError, any>;
}

export type AgentContext = ENVContext &
  LoggerContext &
  JWTProviderContext &
  HTTPProviderContext &
  LangchainContext &
  PuppeteerProviderContext &
  AgentFactoryContext &
  AgentProviderContext;
