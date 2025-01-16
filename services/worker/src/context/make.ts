import path from "path";
import {
  MakeURLMetadata,
  type MakeURLMetadataContext,
} from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import {
  GetFSClient,
  type GetFSClientContext,
} from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { RedisClient } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import {
  MakeSpaceProvider,
  type MakeSpaceProviderConfig,
} from "@liexp/backend/lib/providers/space/space.provider.js";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { editor } from "@liexp/shared/lib/providers/blocknote/ssr.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import type * as axios from "axios";
import ExifReader from "exifreader";
import type ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import type { Redis } from "ioredis";
import TelegramBot from "node-telegram-bot-api";
import type MW from "nodemw";
import type * as pdfJS from "pdfjs-dist/legacy/build/pdf.mjs";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import type sharpT from "sharp";
import { type DataSource } from "typeorm";
import type winkNLP from "wink-nlp";
import { Config } from "../config.js";
import { type WorkerContext } from "./context.js";
import { type ENV } from "#io/env.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";

export interface ContextImplementation {
  redis: { client: Redis };
  wp: { wiki: MW; http: axios.AxiosInstance };
  rw: { wiki: MW; http: axios.AxiosInstance };
  urlMetadata: MakeURLMetadataContext;
  pdf: { client: typeof pdfJS };
  http: { client: axios.AxiosInstance };
  geo: { client: axios.AxiosInstance };
  imgProc: { client: () => Promise<typeof sharpT> };
  ner: { nlp: { client: typeof winkNLP } };
  puppeteer: { client: VanillaPuppeteer };
  ffmpeg: { client: typeof ffmpeg };
  db: { client: TaskEither<WorkerError, DataSource> };
  space: MakeSpaceProviderConfig;
  fs: GetFSClientContext;
}

export const makeContext = (
  env: ENV,
  impl: ContextImplementation,
): TaskEither<WorkerError, WorkerContext> => {
  const serverLogger = GetLogger("worker");

  const config = Config(process.cwd());

  const db = pipe(
    impl.db.client,
    fp.TE.chain(GetTypeORMClient),
    fp.TE.mapLeft(toWorkerError),
  );

  const fsClient = GetFSClient(impl.fs);

  const wpProvider = WikipediaProvider({
    logger: GetLogger("wp"),
    client: impl.wp.wiki,
    restClient: impl.wp.http,
  });

  const rationalWikiProvider = WikipediaProvider({
    logger: GetLogger("rw"),
    client: impl.rw.wiki,
    restClient: impl.rw.http,
  });

  const urlMetadataClient = MakeURLMetadata(impl.urlMetadata);

  const redisClient = RedisClient({
    port: 6379,
    host: env.REDIS_HOST,
    client: impl.redis.client,
  });

  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      env: fp.TE.right(env),
      logger: fp.TE.right(serverLogger),
      db,
      s3: fp.TE.right(MakeSpaceProvider(impl.space)),
      fs: fp.TE.right(fsClient),
      redis: redisClient,
      tg: pipe(
        TGBotProvider(
          {
            logger: serverLogger,
            client: (token, opts) => new TelegramBot(token, opts),
          },
          {
            token: env.TG_BOT_TOKEN,
            chat: env.TG_BOT_CHAT,
            polling: env.TG_BOT_POLLING,
            baseApiUrl: env.TG_BOT_BASE_API_URL,
          },
        ),
        fp.TE.right,
      ),
      ig: fp.TE.right(
        IGProvider({
          logger: serverLogger.extend("ig"),
          credentials: {
            username: env.IG_USERNAME,
            password: env.IG_PASSWORD,
          },
        }),
      ),
      urlMetadata: fp.TE.right(urlMetadataClient),
      puppeteer: fp.TE.right(
        GetPuppeteerProvider(impl.puppeteer.client, {}, puppeteer.KnownDevices),
      ),
      ffmpeg: fp.TE.right(GetFFMPEGProvider(impl.ffmpeg.client)),
      imgProc: pipe(
        fp.TE.tryCatch(() => impl.imgProc.client(), toWorkerError),
        fp.TE.map((sharp) =>
          MakeImgProcClient({
            logger: serverLogger.extend("imgproc"),
            client: sharp,
            exifR: ExifReader,
          }),
        ),
      ),
      http: fp.TE.right(HTTPProvider(impl.http.client)),
      config: config({ fs: fsClient, logger: serverLogger }),
      blocknote: fp.TE.right(editor),
      wp: fp.TE.right(wpProvider),
      rw: fp.TE.right(rationalWikiProvider),
    }),
    fp.TE.bind("geo", (ctx) =>
      fp.TE.right(
        GeocodeProvider({
          http: HTTPProvider(impl.geo.client),
          apiKey: ctx.env.GEO_CODE_API_KEY,
        }),
      ),
    ),
    fp.TE.bind("ner", (ctx) =>
      fp.TE.right(
        GetNERProvider({
          logger: serverLogger.extend("ner"),
          entitiesFile: path.resolve(
            ctx.config.dirs.config.nlp,
            "entities.json",
          ),
          nlp: impl.ner.nlp.client,
        }),
      ),
    ),
    fp.TE.bind("queue", (ctx) =>
      fp.TE.right(GetQueueProvider(fsClient, ctx.config.dirs.temp.queue)),
    ),
    fp.TE.bind("pdf", ({ config }) =>
      fp.TE.right(
        PDFProvider({
          client: impl.pdf.client,
          cMapUrl: config.dirs.pdf.cMapUrl,
          cMapPacked: true,
          standardFontDataUrl: config.dirs.pdf.standardFontDataUrl,
        }),
      ),
    ),
  );
};
