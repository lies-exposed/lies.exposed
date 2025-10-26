import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type LangchainContext } from "@liexp/backend/lib/context/langchain.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type AgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
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

export type AgentContext = ENVContext &
  LoggerContext &
  HTTPProviderContext &
  LangchainContext &
  PuppeteerProviderContext &
  AgentProviderContext;