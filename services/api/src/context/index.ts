import * as path from "path";
import { MakeURLMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import * as axios from "axios";
import * as ExifReader from "exifreader";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import metadataParser from "page-metadata-parser";
import * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from 'puppeteer-extra';
import sharp from "sharp";
import wk from "wikipedia";
import WinkFn from "wink-nlp";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { type ENV } from "#io/ENV.js";
import { LangchainProviderReader } from "#providers/ai/langchain.provider.js";
import { createS3Provider } from "#providers/context/s3.context.js";
import { GetQueueProvider } from "#providers/queue.provider.js";
import { EventsConfig } from "#queries/config/index.js";
import { type RouteContext } from "#routes/route.types.js";
import { getDataSource } from "#utils/data-source.js";

export const makeContext = (
  env: ENV,
): TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");

  const db = pipe(
    getDataSource(env, false),
    fp.TE.chain(GetTypeORMClient),
    fp.TE.mapLeft(toControllerError),
  );

  const wpProvider = WikipediaProvider({
    logger: logger.GetLogger("mw"),
    client: wk,
  });

  const fsClient = GetFSClient();

  const jwtClient = GetJWTProvider({
    secret: env.JWT_SECRET,
    logger: serverLogger,
  });

  const urlMetadataClient = MakeURLMetadata({
    client: axios.default.create({}),
    parser: {
      getMetadata: metadataParser.getMetadata,
    },
  });

  // won't work for production at the moment cause there's no
  // local ai server
  const openai = GetOpenAIProvider({
    baseURL: env.OPENAI_URL,
  });

  const config = {
    cors: {
      origin: env.NODE_ENV === "production" ? true : "*",
    },
    events: EventsConfig,
    dirs: {
      cwd: process.cwd(),
      temp: {
        root: path.resolve(process.cwd(), "temp"),
        media: path.resolve(process.cwd(), "temp/media"),
        nlp: path.resolve(process.cwd(), "temp/nlp"),
        queue: path.resolve(process.cwd(), "temp/queue"),
        stats: path.resolve(process.cwd(), "temp/stats"),
      },
    },
  };
  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      logger: fp.TE.right(serverLogger),
      db,
      s3: fp.TE.right(createS3Provider(env)),
      fs: fp.TE.right(fsClient),
      jwt: fp.TE.right(jwtClient),
      urlMetadata: fp.TE.right(urlMetadataClient),
      env: fp.TE.right(env),
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
      puppeteer: fp.TE.right(
        GetPuppeteerProvider(
          puppeteer as any as VanillaPuppeteer,
          {},
          puppeteer.KnownDevices,
        ),
      ),
      ffmpeg: fp.TE.right(GetFFMPEGProvider(ffmpeg)),
      http: fp.TE.right(HTTPProvider(axios.default.create({}))),
      geo: fp.TE.right(
        GeocodeProvider({
          http: HTTPProvider(
            axios.default.create({ baseURL: env.GEO_CODE_BASE_URL }),
          ),
          apiKey: env.GEO_CODE_API_KEY,
        }),
      ),
      pdf: fp.TE.right(PDFProvider({ client: pdf })),
      wp: fp.TE.right(wpProvider),
      ig: fp.TE.right(
        IGProvider({
          logger: logger.GetLogger("ig"),
          credentials: { username: env.IG_USERNAME, password: env.IG_PASSWORD },
        }),
      ),
      imgProc: fp.TE.right(
        MakeImgProcClient({
          logger: logger.GetLogger("imgproc"),
          client: sharp.bind(sharp),
          exifR: ExifReader,
        }),
      ),
      openai: fp.TE.right(openai),
      langchain: fp.TE.right(LangchainProviderReader),
      queue: fp.TE.right(GetQueueProvider(fsClient, config.dirs.temp.queue)),
      ner: fp.TE.right(
        GetNERProvider({
          logger: logger.GetLogger("ner"),
          entitiesFile: path.resolve(process.cwd(), "config/nlp/entities.json"),
          nlp: WinkFn,
        }),
      ),
      config: fp.TE.right<ControllerError, RouteContext["config"]>(config),
    }),
    fp.TE.mapLeft((e) => ({
      ...e,
      name: e.name,
      status: 500,
    })),
  );
};
