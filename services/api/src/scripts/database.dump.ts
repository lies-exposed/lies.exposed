import { execSync } from "child_process";
import * as path from "path";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import type * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { ENV } from "#io/ENV.js";

const log = logger.GetLogger("database:dump");
const run = (): T.Task<void> => {
  const [prefixFlag, prefix] = process.argv.slice(2);

  if (prefixFlag === undefined || prefix === undefined) {
    throw new Error("Prefix string (-p) is missing.");
  }

  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env", true);

  return pipe(
    process.env,
    Schema.decodeUnknownEither(ENV),
    E.orElse((e) => {
      log.error.log(
        "process.env decode failed %O",
        DecodeError.of("Failed to decode process.env", e),
      );
      return E.left(new Error("process.env decode failed"));
    }),
    TE.fromEither,
    TE.chain((env) => {
      const outputDir = path.resolve(process.cwd(), "./temp/db/dump");
      const ssl =
        env.DB_SSL_MODE === "require"
          ? {
              sslmode: "verify-ca",
              sslrootcert: path.resolve(process.cwd(), env.DB_SSL_CERT_PATH),
            }
          : {};
      log.debug.log("SSL options %O", ssl);
      const pgDumpArgs = {
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        host: env.DB_HOST,
        dbname: env.DB_DATABASE,
        connect_timeout: 30,
        ...ssl,
      };
      const pgDumpArgsString = Object.entries(pgDumpArgs).reduce(
        (acc, [k, v]) => acc.concat(`${k}=${v} `),
        "",
      );
      return pipe(
        E.tryCatch(() => {
          const cmd = `pg_dump "${pgDumpArgsString.trim()}" -v -O --file ${path.resolve(
            outputDir,
            `${prefix}_${new Date().toISOString()}.sql`,
          )}`;

          log.debug.log("Running command \n%s\n", cmd);
          execSync(cmd);
        }, E.toError),
        TE.fromEither,
      );
    }),
    TE.fold(
      (e) => () => Promise.reject(e),
      () => () => Promise.resolve(),
    ),
  );
};

run()()
  .then((m) => {
    // eslint-disable-next-line no-console
    console.log(m);
    process.exit(0);
  })
  .catch((e) => {
    // eslint-disable-next-line
  console.error(e);
    process.exit(1);
  });
