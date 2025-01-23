import { GetLogger } from "@liexp/core/lib/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import D from "debug";
import * as puppeteer from "puppeteer-core";
import { type ConfigContext } from "../context/config.context.js";
import { type DatabaseContext } from "../context/db.context.js";
import { type ENVContext } from "../context/env.context.js";
import { type FFMPEGProviderContext } from "../context/ffmpeg.context.js";
import { type FSClientContext } from "../context/fs.context.js";
import { type HTTPProviderContext } from "../context/http.context.js";
import {
  type ImgProcClientContext,
  type NERProviderContext,
  type TGBotProviderContext,
} from "../context/index.js";
import { type LoggerContext } from "../context/logger.context.js";
import { type PDFProviderContext } from "../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../context/queue.context.js";
import { type SpaceContext } from "../context/space.context.js";
import { type URLMetadataContext } from "../context/urlMetadata.context.js";
import { type BACKEND_ENV } from "../io/ENV.js";
import { MakeURLMetadata } from "../providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "../providers/ffmpeg/ffmpeg.provider.js";
import { GetFSClient } from "../providers/fs/fs.provider.js";
import { MakeImgProcClient } from "../providers/imgproc/imgproc.provider.js";
import { GetNERProvider } from "../providers/ner/ner.provider.js";
import { GetDatabaseClient } from "../providers/orm/index.js";
import { GetPuppeteerProvider } from "../providers/puppeteer.provider.js";
import { GetQueueProvider } from "../providers/queue.provider.js";
import { MakeSpaceProvider } from "../providers/space/space.provider.js";
import { TGBotProvider } from "../providers/tg/tg.provider.js";
import { EventsConfig } from "../queries/config/index.js";
import { mocks } from "./mocks.js";

const pdfContext = PDFProvider({ client: mocks.pdf });

type TestContext = ENVContext &
  PDFProviderContext &
  TGBotProviderContext &
  LoggerContext &
  DatabaseContext &
  PuppeteerProviderContext &
  ConfigContext &
  FSClientContext &
  NERProviderContext &
  URLMetadataContext &
  HTTPProviderContext &
  ImgProcClientContext &
  SpaceContext &
  QueuesProviderContext &
  FFMPEGProviderContext;

export const testConfig = {
  dirs: {
    cwd: "",
    config: { nlp: "" },
    temp: { root: "", queue: "", stats: "", nlp: "", media: "" },
  },
  media: {
    thumbnailHeight: 0,
    thumbnailWidth: 0,
  },
  events: EventsConfig,
};

export const initContext = (): TestContext => {
  D.enable(process.env.DEBUG ?? "*");

  const logger = GetLogger("test");

  const fs = GetFSClient({ client: mocks.fs });

  const ctx = {
    env: process.env as any as BACKEND_ENV,
    db: GetDatabaseClient({
      connection: mocks.db.connection,
      logger,
    }),
    fs,
    s3: MakeSpaceProvider({
      client: mocks.s3.client as any,
      getSignedUrl: mocks.s3.getSignedUrl,
      classes: mocks.s3.classes as any,
    }),
    config: testConfig,
    pdf: pdfContext,
    puppeteer: GetPuppeteerProvider(
      mocks.puppeteer,
      {},
      puppeteer.KnownDevices,
    ),
    ffmpeg: GetFFMPEGProvider(mocks.ffmpeg),
    queue: GetQueueProvider(fs, "fake-queue"),
    http: HTTPProvider(mocks.axios as any),
    ner: GetNERProvider({
      nlp: mocks.ner,
      entitiesFile: "fake",
      logger,
    }),
    urlMetadata: MakeURLMetadata({
      client: mocks.urlMetadata.fetchHTML as any,
      parser: {
        getMetadata: mocks.urlMetadata.fetchMetadata,
      },
    }),
    tg: TGBotProvider(
      { logger: logger, client: () => mocks.tg as any },
      { token: "fake", chat: "fake", polling: false, baseApiUrl: "fake" },
    ),
    imgProc: MakeImgProcClient({
      logger: logger.extend("imgproc"),
      client: mocks.sharp,
      exifR: mocks.exifR,
    }),
    logger: GetLogger("test"),
  };

  return ctx;
};
