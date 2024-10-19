import type * as logger from "@liexp/core/lib/logger/index.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type URLMetadataClient } from "../providers/URLMetadata.provider.js";
import { type FFMPEGProvider } from "../providers/ffmpeg/ffmpeg.provider.js";
import { type FSClient } from "../providers/fs/fs.provider.js";
import { type GeocodeProvider } from "../providers/geocode/geocode.provider.js";
import { type IGProvider } from "../providers/ig/ig.provider.js";
import { type ImgProcClient } from "../providers/imgproc/imgproc.provider.js";
import { type JWTProvider } from "../providers/jwt/jwt.provider.js";
import { type NERProvider } from "../providers/ner/ner.provider.js";
import { type DatabaseClient } from "../providers/orm/index.js";
import { type PuppeteerProvider } from "../providers/puppeteer.provider.js";
import { type SpaceProvider } from "../providers/space/index.js";
import { type TGBotProvider } from "../providers/tg/tg.provider.js";
import { type WikipediaProvider } from "../providers/wikipedia/wikipedia.provider.js";

export interface SpaceContext {
  s3: SpaceProvider.SpaceProvider;
}

export type LoggerContext = {
  logger: logger.Logger;
};

export interface DatabaseContext {
  db: DatabaseClient;
}

export interface FSClientContext {
  fs: FSClient;
}

export interface PDFProviderContext {
  pdf: PDFProvider;
}

export interface HTTPProviderContext {
  http: HTTPProvider;
}

export interface JWTProviderContext {
  jwt: JWTProvider;
}

export interface URLMetadataContext {
  urlMetadata: URLMetadataClient;
}

export interface FFMPEGProviderContext {
  ffmpeg: FFMPEGProvider;
}

export interface GeocodeProviderContext {
  geo: GeocodeProvider;
}

export interface IGProviderContext {
  ig: IGProvider;
}

export interface ImgProcClientContext {
  imgProc: ImgProcClient;
}

export interface NERProviderContext {
  ner: NERProvider;
}

export interface PuppeteerProviderContext {
  puppeteer: PuppeteerProvider;
}

export interface TGBotProviderContext {
  tg: TGBotProvider;
}

export interface WikipediaProviderContext {
  wp: WikipediaProvider;
}
