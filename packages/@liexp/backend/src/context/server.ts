import type * as logger from "@liexp/core/lib/logger/index.js";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { type URLMetadataClient } from "../providers/URLMetadata.provider.js";
import { type FFMPEGProvider } from "../providers/ffmpeg.provider.js";
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

export interface ServerContext {
  db: DatabaseClient;
  s3: SpaceProvider.SpaceProvider;
  logger: logger.Logger;
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
  /**
   * Natural Language Provider
   */
  ner: NERProvider;
}
