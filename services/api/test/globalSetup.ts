import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import * as dotenv from "dotenv";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as path from "path";
import { ENV } from "../src/io/ENV.js";
import { DatabaseClient } from "@liexp/backend/lib/providers/orm/database.provider.js";

const moduleLogger = logger.GetLogger("global-setup");

/**
 * Global setup for e2e tests
 * Uses transactional rollback approach - no need for database pooling or truncation
 * Each test runs in its own transaction which is rolled back after completion
 */
export default async (): Promise<() => void> => {
  try {
    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test"),
    );

    dotenv.config({ path: dotenvConfigPath });

    D.enable(process.env.DEBUG!);

    moduleLogger.debug.log("Process env %O", process.env);

    loadENV(__dirname, dotenvConfigPath, true);
    

    await pipe(
      process.env,
      Schema.decodeUnknownEither(ENV),
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
        appContext?: { db?: DatabaseClient };
        appTest?: { ctx?: { db?: DatabaseClient } };
      };

      try {
        // Close DB connection from app context
        if (g.appContext?.db) {
          await throwTE(g.appContext.db.close());
          moduleLogger.info.log("Closed appContext database connection");
        }

        // Close Redis client from the app context to prevent lingering handles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const redisClient = (g.appContext as any)?.redis;
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
