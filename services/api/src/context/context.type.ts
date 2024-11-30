import {
  type DatabaseContext,
  type FFMPEGProviderContext,
  type FSClientContext,
  type GeocodeProviderContext,
  type IGProviderContext,
  type ImgProcClientContext,
  type JWTProviderContext,
  type LoggerContext,
  type NERProviderContext,
  type PuppeteerProviderContext,
  type SpaceContext,
  type TGBotProviderContext,
  type URLMetadataContext,
  type WikipediaProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { type ServerBlockNoteEditor } from "@liexp/shared/lib/providers/blocknote/ssr.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type AppConfig } from "#app/config.js";
import { type ENV } from "#io/ENV.js";
import { type QueuesProvider } from "#providers/queue.provider.js";

export interface ENVContext {
  env: ENV;
}

interface PDFProviderContext {
  pdf: PDFProvider;
}

interface HTTPProviderContext {
  http: HTTPProvider;
}

interface ConfigContext {
  config: AppConfig;
}

interface QueuesProviderContext {
  queue: QueuesProvider;
}

interface BlockNoteContext {
  blocknote: ServerBlockNoteEditor;
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
  BlockNoteContext & {
    /** RationalWiki Provider */
    rw: WikipediaProvider;
  };
