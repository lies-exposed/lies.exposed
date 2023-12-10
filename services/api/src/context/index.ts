import * as path from "path";
import { MakeURLMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import * as axios from "axios";
import * as ExifReader from "exifreader";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import metadataParser from "page-metadata-parser";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import wk from "wikipedia";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { type ENV } from "#io/ENV.js";
import { createS3Provider } from "#providers/context/s3.context.js";
import { EventsConfig } from "#queries/config/index.js";
import { type RouteContext } from "#routes/route.types.js";
import { getDataSource } from "#utils/data-source.js";

export const makeContext = (
  env: ENV,
): TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");

  const db = pipe(
    getDataSource(env, true),
    fp.TE.chain((source) => GetTypeORMClient(source)),
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
      puppeteer: fp.TE.right(GetPuppeteerProvider(puppeteer, {})),
      ffmpeg: fp.TE.right(GetFFMPEGProvider(ffmpeg)),
      http: fp.TE.right(HTTPProvider(axios.default.create({}))),
      geo: fp.TE.right(
        GeocodeProvider({
          http: HTTPProvider(
            axios.default.create({ baseURL: env.GEO_CODE_BASE_URL }),
          ),
        }),
      ),
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
      config: fp.TE.right({
        events: EventsConfig,
        dirs: {
          cwd: process.cwd(),
          temp: {
            root: path.resolve(process.cwd(), "temp"),
            media: path.resolve(process.cwd(), "temp/media"),
          },
        },
      }),
    }),
    fp.TE.mapLeft((e) => ({
      ...e,
      name: e.name,
      status: 500,
    })),
  );
};
