import type * as logger from "@liexp/core/lib/logger";
import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider";
import { type URLMetadataClient } from "../providers/URLMetadata.provider";
import { type FFMPEGProvider } from "../providers/ffmpeg.provider";
import { type FSClient } from "../providers/fs/fs.provider";
import { type GeocodeProvider } from '../providers/geocode/geocode.provider';
import { type IGProvider } from "../providers/ig/ig.provider";
import { type ImgProcClient } from '../providers/imgproc/imgproc.provider';
import { type JWTProvider } from "../providers/jwt/jwt.provider";
import { type DatabaseClient } from "../providers/orm";
import { type PuppeteerProvider } from "../providers/puppeteer.provider";
import { type SpaceClient } from "../providers/space";
import { type TGBotProvider } from "../providers/tg/tg.provider";
import { type WikipediaProvider } from "../providers/wikipedia/wikipedia.provider";

export interface ServerContext {
  db: DatabaseClient;
  s3: SpaceClient.SpaceClient;
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
  /** Wikipedia Provider */
  wp: WikipediaProvider;
}
