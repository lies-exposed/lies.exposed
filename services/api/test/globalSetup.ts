import { logger } from "@econnessione/core";
import * as dotenv from "dotenv";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
import { ENV } from "../src/io/ENV";

export default async (): Promise<void> => {
  try {
    dotenv.config({ path: `${__dirname}/../../../.env.test` });
    const moduleLogger = logger.GetLogger(__filename);
    return await pipe(
      ENV.decode(process.env),
      E.mapLeft((errs) => {
        const err = new Error();
        (err as any).details = PathReporter.report(E.left(errs));
        return err;
      }),
      TE.fromEither,
      TE.chain((env) =>
        TE.tryCatch(async () => {
          moduleLogger.info.log("Loading tests... %O", env);

          if (env.NODE_ENV === "test") {
            moduleLogger.info.log("Checking containers...");

            // const useDockerContainer = GetDockerContainer(moduleLogger);
            // const VOLUME_DATA = "db-data";

            // // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // (global as any).__DB_TEST_CONTAINER__ = await useDockerContainer({
            //   name: "econnessione-db-test",
            //   Image: "postgres:12",
            //   ExposedPorts: {
            //     "5432/tcp": {},
            //   },
            //   Env: [
            //     `POSTGRES_DB=${env.DB_DATABASE}`,
            //     `POSTGRES_USER=${env.DB_USERNAME}`,
            //     `POSTGRES_PASSWORD=${env.DB_PASSWORD}`,
            //   ],
            //   Volumes: {
            //     "/var/lib/postgresql/data": {},
            //   },
            //   HostConfig: {
            //     Binds: [`${VOLUME_DATA}:/var/lib/postgresql/data`],
            //     PortBindings: {
            //       "5432/tcp": [
            //         {
            //           HostPort: `${env.DB_PORT}`,
            //         },
            //       ],
            //     },
            //   },
            // });

            // const STORAGE_DATA_VOLUME = "minio-data";

            // (global as any).__STORAGE_TEST_CONTAINER__ = await useDockerContainer(
            //   {
            //     name: "italianswitch-storage",
            //     Image: "minio/minio",
            //     AttachStdout: true,
            //     Tty: true,
            //     ExposedPorts: {
            //       "9000/tcp": {},
            //     },
            //     Env: [
            //       `MINIO_ACCESS_KEY=${env.SPACE_ACCESS_KEY_ID}`,
            //       `MINIO_SECRET_KEY=${env.SPACE_ACCESS_KEY_SECRET}`,
            //     ],
            //     Volumes: {
            //       "/data": {},
            //     },
            //     HostConfig: {
            //       Binds: [`${STORAGE_DATA_VOLUME}:/data`],
            //       PortBindings: {
            //         "9000/tcp": [
            //           {
            //             HostPort: `${
            //               config.STORAGE_SERVICE_PORT === undefined
            //                 ? ""
            //                 : `${config.STORAGE_SERVICE_PORT.toString()}`
            //             }`,
            //           },
            //         ],
            //       },
            //     },
            //     Cmd: ["server", "/data"],
            //   }
            // );
            moduleLogger.info.log("Containers ready");
          }
        }, E.toError)
      )
    )().then((result) => {
      if (E.isLeft(result)) {
        if ((result.left as any).details) {
          moduleLogger.error.log('Errors %O', (result.left as any).details);
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
