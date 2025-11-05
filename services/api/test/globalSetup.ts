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

const moduleLogger = logger.GetLogger("global-setup");

/**
 * Global setup for e2e tests
 * With PGlite, we no longer need to manage external PostgreSQL databases
 * Each test file gets its own in-memory PGlite instance automatically
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

    // Validate environment configuration
    await pipe(
      process.env,
      Schema.decodeUnknownEither(ENV),
      TE.fromEither,
      throwTE,
    );

    moduleLogger.info.log("Global test setup completed - using PGlite in-memory databases");

    return async () => {
      moduleLogger.info.log("Global test teardown completed");
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Global setup failed:", e);
    process.exit(1);
  }
};
