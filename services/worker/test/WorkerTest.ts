import { WorkerContext } from "#context/context.js";
import { ENV } from "#io/env.js";
import { toWorkerError } from "#io/worker.error.js";
import { ACTOR_ENTITY_NAME } from "@liexp/backend/lib/entities/Actor.entity.js";
import { AREA_ENTITY_NAME } from "@liexp/backend/lib/entities/Area.entity.js";
import { EVENT_ENTITY_NAME } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GROUP_ENTITY_NAME } from "@liexp/backend/lib/entities/Group.entity.js";
import { GROUP_MEMBER_ENTITY_NAME } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { KEYWORD_ENTITY_NAME } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LINK_ENTITY_NAME } from "@liexp/backend/lib/entities/Link.entity.js";
import { MEDIA_ENTITY_NAME } from "@liexp/backend/lib/entities/Media.entity.js";
import { SOCIAL_POST_ENTITY_NAME } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { STORY_ENTITY_NAME } from "@liexp/backend/lib/entities/Story.entity.js";
import { USER_ENTITY_NAME } from "@liexp/backend/lib/entities/User.entity.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider.js";
import { mocks, type DepsMocks } from "@liexp/backend/lib/test/mocks.js";
import {
  getDataSource,
  getORMConfig,
} from "@liexp/backend/lib/utils/data-source.js";
import { GetLogger, Logger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { AxiosInstance } from "axios";
import { sequenceS, sequenceT } from "fp-ts/lib/Apply.js";
import { toError } from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import path from "path";
import { vi } from "vitest";
import { Config } from "../src/config.js";
import { Schema } from "effect";

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mocks.axios),
  },
}));
vi.mock("page-metadata-parser");
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");
vi.mock("node-telegram-bot-api");

export interface WorkerTest {
  ctx: WorkerContext;
  mocks: DepsMocks;
  utils: {
    e2eAfterAll: () => Promise<boolean>;
  };
}

export const loadAppContext = async (
  logger: Logger,
): Promise<WorkerContext> => {
  return pipe(
    sequenceS(TE.ApplicativePar)({
      db: pipe(
        getDataSource(getORMConfig(process.env as any)),
        TE.chain((source) => GetTypeORMClient(source)),
      ),
      env: pipe(
        Schema.decodeUnknownEither(ENV)(process.env),
        TE.fromEither,
        TE.mapLeft(toWorkerError),
      ),
    }),
    TE.map(({ db, env }) => ({
      env,
      db,
      logger,
      ffmpeg: GetFFMPEGProvider(mocks.ffmpeg),
      puppeteer: GetPuppeteerProvider(
        mocks.puppeteer,
        { headless: "shell" },
        mocks.puppeteer.devices,
      ),
      tg: mocks.tg,
      s3: MakeSpaceProvider(mocks.s3 as any),
      ig: mocks.ig,
      fs: GetFSClient({ client: mocks.fs }),
      wp: mocks.wiki,
      rw: mocks.wiki,
      redis: mocks.redis,
      urlMetadata: {
        fetchHTML: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchHTML(url, opts) as Promise<any>,
            (e) => e as any,
          );
        },
        fetchMetadata: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchMetadata(url, opts) as Promise<any>,
            (e) => e as any,
          );
        },
      },
      http: HTTPProvider(mocks.axios as any as AxiosInstance),
      imgProc: MakeImgProcClient({
        logger,
        exifR: mocks.exifR,
        client: mocks.sharp as any,
      }),
      ner: GetNERProvider({
        logger,
        entitiesFile: path.resolve(__dirname, "entities.json"),
        nlp: mocks.ner as any,
      }),
      langchain: {} as any,
      blocknote: {} as any,
      pdf: PDFProvider({ client: {} as any }),
      geo: GeocodeProvider({
        http: HTTPProvider(mocks.axios as any),
        apiKey: "fake-geo-api-key",
      }),
      queue: GetQueueProvider(mocks.queueFS, "fake-config-path"),
    })),
    TE.bind("config", Config(process.cwd())),
    throwTE,
  );
};

export const initAppTest = async (
  ctx: WorkerContext,
  database: string,
): Promise<WorkerTest> => {
  const appTest = await pipe(
    getDataSource(getORMConfig({ ...ctx.env, DB_DATABASE: database })),
    TE.chain((source) => GetTypeORMClient(source)),
    TE.map((db) => ({ ...ctx, db })),
    TE.map((ctx) => ({
      ctx,
      mocks,
      utils: {
        e2eAfterAll: async () => {
          const liftTruncate = (
            tableName: string,
          ): TE.TaskEither<Error, boolean> =>
            pipe(
              TE.tryCatch(
                () => ctx.db.manager.query(`TRUNCATE "${tableName}" CASCADE;`),
                toError,
              ),
            );

          return pipe(
            sequenceT(TE.ApplicativeSeq)(
              liftTruncate(SOCIAL_POST_ENTITY_NAME),
              liftTruncate(EVENT_ENTITY_NAME),
              liftTruncate(STORY_ENTITY_NAME),
              liftTruncate(ACTOR_ENTITY_NAME),
              liftTruncate(GROUP_ENTITY_NAME),
              liftTruncate(GROUP_MEMBER_ENTITY_NAME),
              liftTruncate(AREA_ENTITY_NAME),
              liftTruncate(MEDIA_ENTITY_NAME),
              liftTruncate(LINK_ENTITY_NAME),
              liftTruncate(KEYWORD_ENTITY_NAME),
              liftTruncate(USER_ENTITY_NAME),
            ),
            TE.map(() => true),
            throwTE,
          ).catch((e) => {
            console.error("Error in e2eAfterAll", e);
            throw e;
          });
        },
      },
    })),
    TE.map((app) => {
      return app;
    }),
    throwTE,
  );

  return appTest;
};

const g = global as any as {
  appTest: WorkerTest;
  appContext: WorkerContext;
};

const appTestLogger = GetLogger("app-test");
export const GetAppTest = async (): Promise<WorkerTest> => {
  appTestLogger.info.log("app context", !!g.appContext);

  if (!g.appContext) {
    g.appContext = await loadAppContext(appTestLogger);
  }

  if (!g.appTest) {
    g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
  }

  return g.appTest;
};
