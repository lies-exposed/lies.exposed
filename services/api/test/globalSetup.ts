/* eslint-disable import/order, import/first */
import moduleAlias from "module-alias";
import * as path from "path";
moduleAlias(path.resolve(__dirname, "../package.json"));
import * as dotenv from "dotenv";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as logger from "../../../packages/@econnessione/core/src/logger";
import * as orm from "../src/providers/orm";
import { getDBOptions } from "../src/utils/getDBOptions";
import { TestENV } from "./TestENV";

export default async (): Promise<void> => {
  try {
    const moduleLogger = logger.GetLogger("tests").extend("teardown");

    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, '/../../../.env.test')
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
        if (env.npm_lifecycle_event.indexOf("spec") > 0) {
          return TE.right(undefined);
        }
        return pipe(
          orm.GetTypeORMClient(getDBOptions(env)),
          TE.orElse(TE.throwError)
        );
      })
    )().then((result) => {
      if (E.isLeft(result)) {
        if ((result.left as any).details) {
          moduleLogger.error.log("Errors %O", (result.left as any).details);
        }
        throw result.left;
      }

      moduleLogger.info.log("Done!");
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};
