import { type URLMetadataClient } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { type FFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import { type FSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { type IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider.js";
import { type ImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { type JWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type NERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { type DatabaseClient } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { type PuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { type SpaceProvider } from "@liexp/backend/lib/providers/space/index.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import type * as logger from "@liexp/core/lib/logger/Logger.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type ENV } from "#io/ENV.js";

interface SpaceContext {
  s3: SpaceProvider.SpaceProvider;
}

export type LoggerContext = {
  logger: logger.Logger;
};

interface DatabaseContext {
  db: DatabaseClient;
}

interface ENVContext {
  env: ENV;
}

export type ServerContext = ENVContext &
  DatabaseContext &
  LoggerContext &
  SpaceContext & {
    s3: SpaceProvider.SpaceProvider;
    jwt: JWTProvider;
    urlMetadata: URLMetadataClient;
    puppeteer: PuppeteerProvider;
    tg: TGBotProvider;
    ffmpeg: FFMPEGProvider;
    http: HTTPProvider;
    geo: GeocodeProvider;
    fs: FSClient;
    ig: IGProvider;
    imgProc: ImgProcClient;
    pdf: PDFProvider;
    /** Wikipedia Provider */
    wp: WikipediaProvider;
    /** RationalWiki Provider */
    rw: WikipediaProvider;
    /**
     * Natural Language Provider
     */
    ner: NERProvider;
  };
