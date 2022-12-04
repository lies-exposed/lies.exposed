import * as logger from "@liexp/core/logger";
import { HTTP } from '@providers/http/http.provider';
import { FFMPEGProvider } from "../providers/ffmpeg.provider";
import { JWTClient } from "../providers/jwt/JWTClient";
import { DatabaseClient } from "../providers/orm";
import { PuppeteerProvider } from "../providers/puppeteer.provider";
import { SpaceClient } from "../providers/space";
import { TGBotProvider } from "../providers/tg/tg.provider";
import { URLMetadataClient } from "../providers/URLMetadata.provider";

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
}
