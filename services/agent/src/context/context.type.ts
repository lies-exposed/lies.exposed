import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type JWTProviderContext } from "@liexp/backend/lib/context/jwt.context.js";
import { type LangchainContext } from "@liexp/backend/lib/context/langchain.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { type ProviderConfigOverride } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { type AgentType } from "@liexp/io/lib/http/Chat.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type ENV } from "#io/ENV.js";

interface ENVContext {
  env: ENV;
}

interface HTTPProviderContext {
  http: HTTPProvider;
}

/**
 * Agent factory for creating agents on-demand with type + provider overrides.
 * The factory caches compiled agents (and their checkpointers) per type +
 * provider config, so it is the single source for both default chat ("auto")
 * and provider-overridden requests.
 */
interface AgentFactoryContext {
  agentFactory: (
    agentType?: AgentType,
    override?: ProviderConfigOverride,
  ) => TaskEither<ServerError, any>;
}

export type AgentContext = ENVContext &
  LoggerContext &
  JWTProviderContext &
  HTTPProviderContext &
  LangchainContext &
  PuppeteerProviderContext &
  FSClientContext &
  AgentFactoryContext;
