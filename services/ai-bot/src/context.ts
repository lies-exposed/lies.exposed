import {
  type LoggerContext,
  type FSClientContext,
  type HTTPProviderContext,
  type PDFProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { type LangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/types.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { type ENV } from "./env.js";

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

export type ClientContext = ENVContext &
  LangchainContext &
  HTTPProviderContext &
  PDFProviderContext &
  APIRESTClientContext &
  EndpointsRESTClientContext &
  FSClientContext &
  LoggerContext;
