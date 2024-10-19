import {
  type IGProviderContext,
  type TGBotProviderContext,
  type DatabaseContext,
  type FSClientContext,
  type LoggerContext,
  type NERProviderContext,
  type SpaceContext,
  type WikipediaProviderContext,
  type JWTProviderContext,
  type URLMetadataContext,
  type PuppeteerProviderContext,
  type FFMPEGProviderContext,
  type GeocodeProviderContext,
  type ImgProcClientContext,
} from "@liexp/backend/lib/context/index.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type AppConfig } from "#app/config.js";
import { type ENV } from "#io/ENV.js";
import { type LangchainProviderReader } from "#providers/ai/langchain.provider.js";
import { type QueuesProvider } from "#providers/queue.provider.js";

export interface ENVContext {
  env: ENV;
}

export interface PDFProviderContext {
  pdf: PDFProvider;
}

export interface HTTPProviderContext {
  http: HTTPProvider;
}

interface ConfigContext {
  config: AppConfig;
}

interface QueuesProviderContext {
  queue: QueuesProvider;
}
interface LangchainContext {
  langchain: LangchainProviderReader;
}

export type ServerContext = ENVContext &
  JWTProviderContext &
  DatabaseContext &
  LoggerContext &
  SpaceContext &
  FSClientContext &
  PDFProviderContext &
  HTTPProviderContext &
  WikipediaProviderContext &
  NERProviderContext &
  TGBotProviderContext &
  IGProviderContext &
  URLMetadataContext &
  PuppeteerProviderContext &
  FFMPEGProviderContext &
  GeocodeProviderContext &
  ImgProcClientContext &
  ConfigContext &
  QueuesProviderContext &
  LangchainContext & {
    /** RationalWiki Provider */
    rw: WikipediaProvider;
  };
