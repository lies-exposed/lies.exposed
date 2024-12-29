import { type APIContext } from "@liexp/backend/lib/context/api.context.js";
import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import {
  type FFMPEGProviderContext,
  type GeocodeProviderContext,
  type IGProviderContext,
  type ImgProcClientContext,
  type NERProviderContext,
  type TGBotProviderContext,
  type URLMetadataContext,
  type WikipediaProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { type JWTProviderContext } from "@liexp/backend/lib/context/jwt.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type SpaceContext } from "@liexp/backend/lib/context/space.context.js";
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
  APIContext &
  BlockNoteContext & {
    /** RationalWiki Provider */
    rw: WikipediaProvider;
  };
