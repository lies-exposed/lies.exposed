import * as path from "path";
import { loadENV } from "@liexp/core/lib/env/utils";
import * as logger from "@liexp/core/lib/logger";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as dotenv from "dotenv";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import { TestENV } from "./TestENV";

export default async (): Promise<() => void> => {
  try {
    const moduleLogger = logger.GetLogger("tests").extend("teardown");

    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test")
    );

    dotenv.config({ path: dotenvConfigPath });

    moduleLogger.debug.log("Process env %O", process.env);

    loadENV(__dirname, dotenvConfigPath, true);

    await pipe(
      TestENV.decode(process.env),
      E.mapLeft((errs) => {
        const err = new Error();
        (err as any).details = PathReporter.report(E.left(errs));
        return err as any;
      }),
      TE.fromEither,
      throwTE
    );

    return () => {
      // eslint-disable-next-line no-console
      console.log("global teardown");
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};
