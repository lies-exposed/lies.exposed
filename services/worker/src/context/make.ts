import path from "path";
import { MakeURLMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { createS3Provider } from "@liexp/backend/lib/providers/space/creates3.provider.js";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import {
  getDataSource,
  getORMConfig,
} from "@liexp/backend/lib/utils/data-source.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { editor } from "@liexp/shared/lib/providers/blocknote/ssr.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import * as axios from "axios";
import ExifReader from "exifreader";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { Redis } from "ioredis";
import MW from "nodemw";
import metadataParser from "page-metadata-parser";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import type sharpT from "sharp";
import WinkFn from "wink-nlp";
import { Config } from "../config.js";
import { type WorkerContext } from "./context.js";
import { type ENV } from "#io/env.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";

export const makeContext = (
  env: ENV,
): TaskEither<WorkerError, WorkerContext> => {
  const serverLogger = GetLogger("worker");

  const config = Config(process.cwd());

  const db = pipe(
    getDataSource(getORMConfig(env, false)),
    fp.TE.chain(GetTypeORMClient),
    fp.TE.mapLeft(toWorkerError),
  );

  const fsClient = GetFSClient();

  const wpProvider = WikipediaProvider({
    logger: GetLogger("wp"),
    client: new MW({
      protocol: "https",
      server: "en.wikipedia.org",
      path: "/w",
      debug: true,
      concurrency: 5,
    }),
    restClient: axios.default.create({
      baseURL: "https://en.wikipedia.org/api/rest_v1",
    }),
  });

  const rationalWikiProvider = WikipediaProvider({
    logger: GetLogger("rw"),
    client: new MW({
      protocol: "https",
      server: "rationalwiki.org",
      path: "/w",
      debug: true,
      concurrency: 5,
    }),
    restClient: axios.default.create({
      baseURL: "https://rationalwiki.org/api/rest_v1",
    }),
  });

  const urlMetadataClient = MakeURLMetadata({
    client: axios.default.create({}),
    parser: {
      getMetadata: metadataParser.getMetadata,
    },
  });

  const redisClient = fp.TE.tryCatch(async () => {
    const redis = new Redis(6379, env.REDIS_HOST, {
      lazyConnect: true,
    });

    if (env.REDIS_CONNECT) {
      await redis.connect();
    }
    return redis;
  }, toWorkerError);

  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      logger: fp.TE.right(serverLogger),
      db,
      s3: fp.TE.right(createS3Provider(env)),
      fs: fp.TE.right(fsClient),
      env: fp.TE.right(env),
      redis: redisClient,
      tg: pipe(
        TGBotProvider(
          { logger: serverLogger },
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
        GetPuppeteerProvider(
          puppeteer as any as VanillaPuppeteer,
          {},
          puppeteer.KnownDevices,
        ),
      ),
      ffmpeg: fp.TE.right(GetFFMPEGProvider(ffmpeg)),
      imgProc: pipe(
        fp.TE.tryCatch(
          (): Promise<typeof sharpT> =>
            import("sharp").then((imp) => imp.default),
          toWorkerError,
        ),
        fp.TE.map((sharp) =>
          MakeImgProcClient({
            logger: serverLogger.extend("imgproc"),
            client: sharp.bind(sharp),
            exifR: ExifReader,
          }),
        ),
      ),
      http: fp.TE.right(HTTPProvider(axios.default.create({}))),
      pdf: pipe(
        fp.TE.tryCatch(
          () => import("pdfjs-dist/legacy/build/pdf.mjs"),
          toWorkerError,
        ),
        fp.TE.map((pdf) => PDFProvider({ client: pdf })),
      ),
      config: fp.TE.right(config),
      queue: fp.TE.right(GetQueueProvider(fsClient, config.dirs.temp.queue)),
      geo: fp.TE.right(
        GeocodeProvider({
          http: HTTPProvider(
            axios.default.create({ baseURL: env.GEO_CODE_BASE_URL }),
          ),
          apiKey: env.GEO_CODE_API_KEY,
        }),
      ),
      blocknote: fp.TE.right(editor),
      ner: fp.TE.right(
        GetNERProvider({
          logger: serverLogger.extend("ner"),
          entitiesFile: path.resolve(process.cwd(), "config/nlp/entities.json"),
          nlp: WinkFn,
        }),
      ),
      wp: fp.TE.right(wpProvider),
      rw: fp.TE.right(rationalWikiProvider),
    }),
  );
};
