import * as dotenv from "dotenv";
import * as path from "path";
const moduleAlias = require("module-alias");
moduleAlias(path.resolve(__dirname, "../package.json"));
import * as logger from "../../../packages/@econnessione/core/src/logger";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { ENV } from "../src/io/ENV";
import { PathReporter } from "io-ts/lib/PathReporter";
import { getDBOptions } from "../src/utils/getDBOptions";
import * as orm from "../src/providers/orm";

export default async (): Promise<void> => {
  try {
    const moduleLogger = logger.GetLogger("tests");

    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? `${__dirname}/../../../.env.test`
    );

    dotenv.config({ path: dotenvConfigPath });

    moduleLogger.debug.log("Process env %O", process.env);
    return await pipe(
      ENV.decode(process.env),
      E.mapLeft((errs) => {
        const err = new Error();
        (err as any).details = PathReporter.report(E.left(errs));
        return err;
      }),
      TE.fromEither,
      TE.chain((env) =>
        pipe(
          orm.GetTypeORMClient(getDBOptions(env)),
          TE.chain((db) => db.close()),
          TE.mapLeft(E.toError)
        )
      )
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
