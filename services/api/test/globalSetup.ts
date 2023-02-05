/* eslint-disable import/order, import/first */
import moduleAlias from "module-alias";
import * as path from "path";
moduleAlias(path.resolve(__dirname, "../package.json"));
import * as logger from "@liexp/core/logger";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as dotenv from "dotenv";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { PathReporter } from "io-ts/lib/PathReporter";
import { TestENV } from "./TestENV";

export default async (): Promise<void> => {
  try {
    const moduleLogger = logger.GetLogger("tests").extend("teardown");

    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ??
        path.join(__dirname, "/../../../.env.test")
    );

    dotenv.config({ path: dotenvConfigPath });

    moduleLogger.debug.log("Process env %O", process.env);

    return await pipe(
      TestENV.decode(process.env),
      E.mapLeft((errs) => {
        const err = new Error();
        (err as any).details = PathReporter.report(E.left(errs));
        return err as any;
      }),
      TE.fromEither,
      TE.chain((env) => {
        // if (env.npm_lifecycle_event.indexOf("spec") > 0) {
        //   return TE.right(undefined);
        // }

        return pipe(
          TE.tryCatch(() => Promise.resolve(), E.toError),
          TE.orElse(TE.throwError),
          TE.map((appTest) => {
            (global as any).appTest = appTest;
            return appTest;
          })
        );
      }),
      (te) => throwTE<any, any>(te)
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};
