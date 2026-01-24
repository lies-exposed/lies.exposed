import * as path from "path";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import D from "debug";
import * as dotenv from "dotenv";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

const moduleLogger = logger.GetLogger("global-setup");

/**
 * Generic global setup for e2e tests
 * Uses transactional rollback approach - no need for database pooling or truncation
 * Each test runs in its own transaction which is rolled back after completion
 *
 * @param envSchema - Effect Schema for environment validation
 * @param dotenvConfigPath - Path to .env file (default: ../../../.env.test)
 */
export const createGlobalSetup = <A, I = any>(
  envSchema: Schema.Schema<A, I, never>,
  dotenvConfigPath?: string,
) => {
  return async (): Promise<() => Promise<void>> => {
    try {
      const configPath =
        dotenvConfigPath ?? path.resolve(process.cwd(), ".env.test");

      dotenv.config({ path: configPath });

      D.enable(process.env.DEBUG!);

      moduleLogger.debug.log("Process env %O", process.env);

      loadENV(process.cwd(), configPath, true);

      await pipe(
        process.env,
        Schema.decodeUnknownEither(envSchema),
        TE.fromEither,
        throwTE,
      );

      moduleLogger.info.log(
        "Global test setup completed - using transactional rollback for test isolation",
      );

      return async () => {
        moduleLogger.info.log("Global test teardown started");

        // Close all connections when tests are complete
        const g = global as unknown as {
          appContext?: { db?: any; redis?: any };
          appTest?: { ctx?: { db?: any; redis?: any } };
        };

        try {
          // Close DB connection from app context
          if (g.appContext?.db) {
            await throwTE(g.appContext.db.close());
            moduleLogger.info.log("Closed appContext database connection");
          }

          // Close Redis client from the app context to prevent lingering handles
          const redisClient = g.appContext?.redis;
          if (redisClient && typeof redisClient.quit === "function") {
            await redisClient.quit();
            moduleLogger.info.log("Closed Redis connection");
          }
        } catch (e) {
          moduleLogger.error.log("Error during teardown:", e);
        }

        moduleLogger.info.log("Global test teardown completed");
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  };
};
