import * as logger from "@liexp/core/logger";
import { URLMetadataClient } from "@liexp/shared/providers/URLMetadata.provider";
import { FFMPEGProvider } from '@liexp/shared/providers/ffmpeg.provider';
import { PuppeteerProvider } from "@liexp/shared/providers/puppeteer.provider";
import { Router } from "express";
import { ENV } from "@io/ENV";
import { JWTClient } from "@providers/jwt/JWTClient";
import { DatabaseClient } from "@providers/orm";
import { SpaceClient } from "@providers/space";
import { TGBotProvider } from "@providers/tg/tg.provider";

export interface RouteContext {
  db: DatabaseClient;
  s3: SpaceClient.SpaceClient;
  env: ENV;
  logger: logger.Logger;
  jwt: JWTClient;
  urlMetadata: URLMetadataClient;
  puppeteer: PuppeteerProvider;
  tg: TGBotProvider;
  ffmpeg: FFMPEGProvider
}

export type Route = (r: Router, ctx: RouteContext) => void;
