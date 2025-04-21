import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type HTTPProviderContext } from "@liexp/backend/lib/context/http.context.js";
import { type LangchainContext } from "@liexp/backend/lib/context/langchain.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PDFProviderContext } from "@liexp/backend/lib/context/pdf.context.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type OpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { type API } from "@ts-endpoint/resource-client";
import { type AIBotConfig } from "./config.js";
import { type ENV } from "./env.js";
import { type ConfigProvider } from "#common/config/config.reader.js";

interface EndpointsRESTClientContext {
  endpointsRESTClient: API<Endpoints>;
}

interface ENVContext {
  env: ENV;
}

interface ConfigContext {
  config: ConfigProvider<AIBotConfig>;
}

interface OpenAIContext {
  openAI: OpenAIProvider;
}

export type ClientContext = ENVContext &
  ConfigContext &
  LangchainContext &
  OpenAIContext &
  HTTPProviderContext &
  PDFProviderContext &
  EndpointsRESTClientContext &
  FSClientContext &
  LoggerContext;
