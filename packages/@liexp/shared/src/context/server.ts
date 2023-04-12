import type * as logger from "@liexp/core/lib/logger";
import { type URLMetadataClient } from "../providers/URLMetadata.provider";
import { type FFMPEGProvider } from "../providers/ffmpeg.provider";
import { type FSClient } from '../providers/fs/fs.provider';
import { type HTTP } from '../providers/http/http.provider';
import { type JWTClient } from "../providers/jwt/JWTClient";
import { type DatabaseClient } from "../providers/orm";
import { type PuppeteerProvider } from "../providers/puppeteer.provider";
import { type SpaceClient } from "../providers/space";
import { type TGBotProvider } from "../providers/tg/tg.provider";

export interface ServerContext {
  db: DatabaseClient;
  s3: SpaceClient.SpaceClient;
  logger: logger.Logger;
  jwt: JWTClient;
  urlMetadata: URLMetadataClient;
  puppeteer: PuppeteerProvider;
  tg: TGBotProvider;
  ffmpeg: FFMPEGProvider;
  http: HTTP;
  fs: FSClient
}
