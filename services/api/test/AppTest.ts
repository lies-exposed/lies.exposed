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
import { DatabaseClient, GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { GetRedisClient } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider.js";
import { DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
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

export interface AppTest {
  ctx: ServerContext;
  mocks: DepsMocks;
  req: TestAgent<supertest.Test>;
}

const loadAppContext = async (
  logger: Logger,
  database: string,
  dbOverride?: DatabaseClient,
): Promise<ServerContext> => {
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
    TE.bind("db", () =>
      // Use provided DatabaseClient or create a new one
      dbOverride
        ? TE.right(dbOverride)
        : pipe(
            getInitializedPGliteDataSource(database),
            TE.tap((source) => {
              // Mark the datasource that will be used by ctx.db
              (source as any).__usedByCtxDb = true;
              console.log(`🔍 [APPTEST] DataSource created for ctx.db, marked as __usedByCtxDb`);
              return TE.right(undefined);
            }),
            TE.chain((source) => GetTypeORMClient(source)),
          )
    ),
    TE.bind("redis", ({ env }) =>
      GetRedisClient({
        client: () => mocks.redis,
        connect: env.REDIS_CONNECT,
      }),
    ),
    TE.map(({ db, env, redis }) => {
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
              () => {
                return mocks.urlMetadata.fetchMetadata(url, opts);
              },
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
        redis,
        geo: GeocodeProvider({
          http: HTTPProvider(mocks.axios as any),
          apiKey: "fake-geo-api-key",
        }),
        queue: GetQueueProvider(mocks.queueFS, "fake-config-path"),
      };
    }),
    throwTE,
  );
};

const initAppTest = async (
  ctx: ServerContext,
): Promise<AppTest> => {
  const appTest = await pipe(
    TE.Do,
    TE.apS("ctx", TE.right(ctx)),
    TE.map(({ ctx }) => ({
      ctx,
      mocks,
      req: supertest(makeApp(ctx)),
    })),
    throwTE,
  );

  return appTest;
};

// Store per-file test context using the test file path as key
// Export these so testSetup.ts can clear them
const testContexts = new Map<string, ServerContext>();
const testInstances = new Map<string, AppTest>();

const appTestLogger = GetLogger("app-test");

/**
 * Get or create AppTest for the current test file
 * Reuses datasource within worker with transaction-based isolation
 */
export const GetAppTest = async (
  dbOverride?: DatabaseClient,
): Promise<AppTest> => {
  // Use worker ID for instance isolation
  const testFileId = process.env.VITEST_POOL_ID || "default";
  const dbName = `test_${testFileId}`;

  appTestLogger.info.log("Getting app test for worker ID: %s (dbOverride: %s)", testFileId, !!dbOverride);

  // If a dbOverride is provided, we always create a fresh context
  // This ensures the API is initialized with the transactional DB
  if (dbOverride) {
    appTestLogger.debug.log("Creating context with transactional DB for worker: %s", testFileId);
    const context = await loadAppContext(appTestLogger, dbName, dbOverride);
    const appTest = await initAppTest(context);
    
    // Update caches
    testContexts.set(testFileId, context);
    testInstances.set(testFileId, appTest);
    
    return appTest;
  }

  // Check if we already have a context for this worker
  let context = testContexts.get(testFileId);
  if (!context) {
    appTestLogger.debug.log("Creating new context for worker: %s", testFileId);
    context = await loadAppContext(appTestLogger, dbName);
    testContexts.set(testFileId, context);
  }

  // Check if we already have an app test for this worker
  let appTest = testInstances.get(testFileId);
  if (!appTest) {
    appTestLogger.debug.log("Creating new app test for worker: %s", testFileId);
    appTest = await initAppTest(context);
    testInstances.set(testFileId, appTest);
  }

  return appTest;
};

/**
 * Clean up test context for a specific test file
 * Should be called in afterAll hook
 * Note: We don't close the DB here as it's reused across test files in the worker
 */
export const cleanupTestContext = async (): Promise<void> => {
  // Cleanup is handled by transaction rollback in testSetup.ts
  // The datasource remains open for the next test file
};
