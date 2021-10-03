import { execSync } from "child_process";
import * as path from "path";
import * as logger from "@econnessione/core/logger";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ENV } from "@io/ENV";

const log = logger.GetLogger("database:dump");
const run = (): TE.TaskEither<Error, void> => {
  const [prefixFlag, prefix] = process.argv.slice(2);

  if (prefixFlag === undefined || prefix === undefined) {
    throw new Error("Prefix string (-p) is missing.");
  }

  return pipe(
    ENV.decode(process.env),
    E.orElse((e) => {
      // eslint-disable-next-line
      console.error(e);
      return E.left(new Error());
    }),
    TE.fromEither,
    TE.chain((env) => {
      const outputDir = path.resolve(process.cwd(), "./db/dump");
      const pgDumpArgs = {
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        host: env.DB_HOST,
        dbname: env.DB_DATABASE,
        connect_timeout: 15,
        ...(env.DB_SSL_MODE === "require"
          ? {
              sslmode: "require",
              sslrootcert: path.resolve(process.cwd(), env.DB_SSL_CERT_PATH),
            }
          : {}),
      };
      const pgDumpArgsString = Object.entries(pgDumpArgs).reduce(
        (acc, [k, v]) => acc.concat(`${k}=${v} `),
        ""
      );
      return pipe(
        E.tryCatch(() => {
          const cmd = `pg_dump "${pgDumpArgsString}" -O --file ${path.resolve(
            outputDir,
            `${prefix}_${new Date().toISOString()}.sql`
          )}`;

          log.debug.log("Running command \n%s\n", cmd);
          execSync(cmd);
        }, E.toError),
        TE.fromEither
      );
    })
  );
};

// eslint-disable-next-line no-console
run()().then(console.log).catch(console.error);
