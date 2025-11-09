import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type HTTPProviderContext } from "@liexp/backend/lib/context/http.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PDFProviderContext } from "@liexp/backend/lib/context/pdf.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type Endpoints as AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type API } from "@ts-endpoint/resource-client";
import { type AIBotConfig } from "./config.js";
import { type ENV } from "./env.js";
import { type ConfigProvider } from "#common/config/config.reader.js";

interface APIClientContext {
  api: API<Endpoints>;
}

interface AgentClientContext {
  agent: API<AgentEndpoints>;
}

interface ENVContext {
  env: ENV;
}

interface AIBotConfigContext {
  config: ConfigProvider<AIBotConfig>;
}

export type ClientContext = ENVContext &
  AIBotConfigContext &
  HTTPProviderContext &
  PDFProviderContext &
  APIClientContext &
  AgentClientContext &
  FSClientContext &
  PuppeteerProviderContext &
  LoggerContext;
