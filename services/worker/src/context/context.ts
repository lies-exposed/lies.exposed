import { type BlockNoteContext } from "@liexp/backend/lib/context/blocknote.context.js";
import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type FFMPEGProviderContext } from "@liexp/backend/lib/context/ffmpeg.context.js";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type HTTPProviderContext } from "@liexp/backend/lib/context/http.context.js";
import {
  type GeocodeProviderContext,
  type IGProviderContext,
  type ImgProcClientContext,
  type TGBotProviderContext,
  type WikipediaProviderContext,
  type NERProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PDFProviderContext } from "@liexp/backend/lib/context/pdf.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type QueuesProviderContext } from "@liexp/backend/lib/context/queue.context.js";
import { type RedisContext } from "@liexp/backend/lib/context/redis.context.js";
import { type SpaceContext } from "@liexp/backend/lib/context/space.context.js";
import { type URLMetadataContext } from "@liexp/backend/lib/context/urlMetadata.context.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { type WorkerConfig } from "../config.js";
import { type ENV } from "#io/env.js";

interface ENVContext {
  env: ENV;
}

interface ConfigContext {
  config: WorkerConfig;
}

export type WorkerContext = ENVContext &
  LoggerContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  RedisContext &
  SpaceContext &
  PDFProviderContext &
  HTTPProviderContext &
  PuppeteerProviderContext &
  // natural language processing
  NERProviderContext &
  // image and video processing
  ImgProcClientContext &
  FFMPEGProviderContext &
  // social providers
  TGBotProviderContext &
  IGProviderContext &
  // persistent queue
  QueuesProviderContext &
  // Third-party providers
  GeocodeProviderContext &
  // Blocknote
  BlockNoteContext &
  URLMetadataContext &
  WikipediaProviderContext & {
    rw: WikipediaProvider;
  };
