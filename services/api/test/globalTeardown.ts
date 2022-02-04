/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/order */
import * as path from "path";
import * as dotenv from "dotenv";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as logger from "../../../packages/@econnessione/core/src/logger";
import * as orm from "../src/providers/orm";
import { getDBOptions } from "../src/utils/getDBOptions";
import { TestENV } from "./TestENV";
const moduleAlias = require("module-alias");
moduleAlias(path.resolve(__dirname, "../package.json"));

export default async (): Promise<void> => {
  try {
    const moduleLogger = logger.GetLogger("tests");

    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ??
        path.resolve(__dirname, "/../../../.env.test")
    );

    dotenv.config({ path: dotenvConfigPath });

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
          TE.chain((db) => db.close()),
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
