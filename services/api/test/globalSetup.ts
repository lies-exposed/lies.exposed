import * as path from "path";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as dotenv from "dotenv";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { PathReporter } from "io-ts/PathReporter";
import { TestENV } from "./TestENV.js";
import { testDBContainer } from "./GetDockerContainer.js";
import D from "debug";

const moduleLogger = logger.GetLogger("global-setup");

const DATABASE_TOTAL = 30;

export default async (): Promise<() => void> => {
  try {
    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test"),
    );

    dotenv.config({ path: dotenvConfigPath });

    D.enable(process.env.DEBUG!);

    moduleLogger.debug.log("Process env %O", process.env);

    loadENV(__dirname, dotenvConfigPath, true);

    if (!process.env.CI) {
      await testDBContainer.assertLocalCacheFolder();

      await testDBContainer.lookup();

      await testDBContainer.addDatabases(DATABASE_TOTAL);
    }

    await pipe(
      TestENV.decode(process.env),
      E.mapLeft((errs) => {
        const err = new Error();
        (err as any).details = PathReporter.report(E.left(errs));
        return err as any;
      }),
      TE.fromEither,
      throwTE,
    );

    return async () => {
      if (!process.env.CI) {
        const stats = await testDBContainer.getRunStats();
        // eslint-disable-next-line no-console
        console.log(
          `Test ran on ${stats.used} databases over a total of ${DATABASE_TOTAL}`,
        );
        await testDBContainer.freeDatabases();
      }
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};
