import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import {
  type GeocodeProviderContext,
  type NERProviderContext,
  type WikipediaProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { type JWTProviderContext } from "@liexp/backend/lib/context/jwt.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type PuppeteerProviderContext } from "@liexp/backend/lib/context/puppeteer.context.js";
import { type QueuesProviderContext } from "@liexp/backend/lib/context/queue.context.js";
import { type RedisContext } from "@liexp/backend/lib/context/redis.context.js";
import { type SpaceContext } from "@liexp/backend/lib/context/space.context.js";
import { type URLMetadataContext } from "@liexp/backend/lib/context/urlMetadata.context.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { type ServerBlockNoteEditor } from "@liexp/shared/lib/providers/blocknote/ssr.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type AppConfig } from "#app/config.js";
import { type ENV } from "#io/ENV.js";

interface ENVContext {
  env: ENV;
}

interface HTTPProviderContext {
  http: HTTPProvider;
}

interface ConfigContext {
  config: AppConfig;
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
  HTTPProviderContext &
  WikipediaProviderContext &
  NERProviderContext &
  URLMetadataContext &
  PuppeteerProviderContext &
  ConfigContext &
  QueuesProviderContext &
  BlockNoteContext &
  GeocodeProviderContext &
  RedisContext & {
    /** RationalWiki Provider */
    rw: WikipediaProvider;
  };
