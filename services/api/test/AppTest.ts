import { Config } from "#app/config.js";
import { makeApp } from "#app/index.js";
import { type ServerContext } from "#context/context.type.js";
import { toControllerError } from "#io/ControllerError.js";
import { ENV } from "#io/ENV.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider.js";
import { DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
import {
  getDataSource,
  getORMConfig,
} from "@liexp/backend/lib/utils/data-source.js";
import { GetLogger, Logger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { AxiosInstance } from "axios";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as path from "path";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { vi } from "vitest";

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

export interface AppTest {
  ctx: ServerContext;
  mocks: DepsMocks;
  req: TestAgent<supertest.Test>;
}

let context: ServerContext | undefined = undefined;
export const loadAppContext = async (
  logger: Logger,
  database: string,
): Promise<ServerContext> => {
  if (context) {
    return context;
  }

  return pipe(
    TE.Do,
    TE.bind("env", () =>
      pipe(
        process.env,
        Schema.decodeUnknownEither(ENV),
        TE.fromEither,
        TE.mapLeft(toControllerError),
      ),
    ),
    TE.bind("db", ({ env }) =>
      pipe(
        getDataSource(getORMConfig({ ...env, DB_DATABASE: database }, false)),
        TE.chain((source) => GetTypeORMClient(source)),
      ),
    ),
    TE.map(({ db, env }) => {
      const config = Config(env, path.resolve(__dirname, "../temp"));

      return {
        env,
        db,
        logger,
        config,
        jwt: GetJWTProvider({ secret: env.JWT_SECRET, logger }),
        ffmpeg: GetFFMPEGProvider(mocks.ffmpeg),
        puppeteer: GetPuppeteerProvider(
          mocks.puppeteer,
          { headless: "shell" },
          mocks.puppeteer.devices,
        ),
        s3: MakeSpaceProvider(mocks.s3 as any),
        fs: GetFSClient({ client: mocks.fs }),
        wp: mocks.wiki,
        rw: mocks.wiki,
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
        ner: GetNERProvider({
          logger,
          entitiesFile: path.resolve(config.dirs.config.nlp, "entities.json"),
          nlp: mocks.ner,
        }),
        blocknote: {} as any,
        redis: mocks.redis,
        geo: GeocodeProvider({
          http: HTTPProvider(mocks.axios as any),
          apiKey: "fake-geo-api-key",
        }),
        queue: GetQueueProvider(mocks.queueFS, "fake-config-path"),
      };
    }),
    TE.map((ctx) => {
      context = ctx;
      return ctx;
    }),
    throwTE,
  );
};

export const initAppTest = async (
  ctx: ServerContext,
  database: string,
): Promise<AppTest> => {
  const appTest = await pipe(
    TE.Do,
    TE.apS("ctx", TE.right(ctx)),
    TE.bind("db", ({ ctx }) => {
      if (database === ctx.db.manager.connection.driver.database) {
        return TE.right(ctx.db);
      }

      ctx.logger.debug.log("Connecting to new DB %s", database);

      return pipe(
        getDataSource(
          getORMConfig({ ...ctx.env, DB_DATABASE: database }, false),
        ),
        TE.chain((source) => GetTypeORMClient(source)),
      );
    }),
    TE.map(({ ctx, db }) => ({ ...ctx, db })),
    TE.map((ctx) => ({
      ctx,
      mocks,
      req: supertest(makeApp(ctx)),
    })),
    TE.map((app) => {
      return app;
    }),
    throwTE,
  );

  return appTest;
};

const g = global as unknown as {
  appTest: AppTest;
  appContext: ServerContext;
};

const appTestLogger = GetLogger("app-test");
export const GetAppTest = async (): Promise<AppTest> => {
  appTestLogger.info.log("app context", !!g.appContext);

  if (!g.appContext) {
    g.appContext = await loadAppContext(
      appTestLogger,
      process.env.DB_DATABASE!,
    );
  }

  appTestLogger.info.log("app test", !!g.appTest, process.env.DB_DATABASE);

  if (!g.appTest) {
    g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
  }

  return g.appTest;
};
