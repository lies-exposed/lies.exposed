import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type HTTPProviderContext } from "@liexp/backend/lib/context/http.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PDFProviderContext } from "@liexp/backend/lib/context/pdf.context.js";
import { type LangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/types.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { type OpenAI } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { type AIBotConfig } from "./config.js";
import { type ENV } from "./env.js";
import { type ConfigProvider } from "#common/config/config.reader.js";

interface EndpointsRESTClientContext {
  endpointsRESTClient: EndpointsRESTClient<Endpoints>;
}

interface APIRESTClientContext {
  apiRESTClient: APIRESTClient;
}

interface LangchainContext {
  langchain: LangchainProvider;
}

interface ENVContext {
  env: ENV;
}

interface ConfigContext {
  config: ConfigProvider<AIBotConfig>;
}

interface OpenAIContext {
  openAI: OpenAI;
}

export type ClientContext = ENVContext &
  ConfigContext &
  LangchainContext &
  OpenAIContext &
  HTTPProviderContext &
  PDFProviderContext &
  APIRESTClientContext &
  EndpointsRESTClientContext &
  FSClientContext &
  LoggerContext;
