/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias")(process.cwd());
import * as fs from "fs";
import * as path from "path";
import { logger } from "@econnessione/core";
import { fromIOError } from "@io/APIError";
import { ENV } from "@io/ENV";
import { GetMDXClient } from "@providers/mdx";
import { GetTypeORMClient } from "@providers/orm";
import { S3Client } from "@providers/space";
import { GetFSClient } from "@providers/space/FSClient";
import { ActorEntity } from "@routes/actors/actor.entity";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { ArticleEntity } from "@routes/articles/article.entity";
import { MakeArticlesRoutes } from "@routes/articles/articles.route";
import { MakeGraphsRoute } from "@routes/graphs/getGraph.controller";
import { GroupEntity } from "@routes/groups/group.entity";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { PageEntity } from "@routes/pages/page.entity";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import * as AWS from "aws-sdk";
import cors from "cors";
import express from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
import "reflect-metadata";
import { IOError } from "ts-shared/lib/errors";
import { ProjectEntity } from "@routes/projects/project.entity";

// var whitelist = ["http://localhost:8002"]
var corsOptions: cors.CorsOptions = {
  origin: true,
};

const run = (): Promise<void> => {
  const serverLogger = logger.GetLogger("api");

  return pipe(
    ENV.decode(process.env),
    serverLogger.debug.logInPipe("Decoded env result %O"),
    E.mapLeft(
      (errs) =>
        new IOError(600, "Can't decode the environment", {
          kind: "ServerError",
          meta: PathReporter.report(E.left(errs)),
        })
    ),
    TE.fromEither,
    TE.chain((env) =>
      pipe(
        sequenceS(TE.taskEither)({
          db: GetTypeORMClient({
            type: "postgres",
            host: env.DB_HOST,
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_DATABASE,
            port: env.DB_PORT,
            entities: [PageEntity, ActorEntity, GroupEntity, ArticleEntity, ProjectEntity],
            synchronize: true,
            ssl:
              env.DB_SSL_MODE === "require"
                ? {
                    ca: fs.readFileSync(
                      path.join(__dirname, "../certs/dev-certificate.crt"),
                      {
                        encoding: "utf-8",
                      }
                    ),
                  }
                : false,
          }),
          s3:
            env.NODE_ENV === "development"
              ? TE.right(
                  GetFSClient({
                    basePath: path.resolve(__dirname, "../data"),
                    baseUrl: `http://localhost:${env.API_PORT}`,
                    logger: serverLogger,
                  })
                )
              : TE.right(
                  S3Client.GetS3Client({
                    endpoint: new AWS.Endpoint("fra1.digitaloceanspaces.com"),
                    region: env.SPACE_REGION,
                    credentials: {
                      accessKeyId: env.SPACE_ACCESS_KEY_ID,
                      secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
                    },
                  })
                ),
          mdx: TE.right(
            GetMDXClient({
              contentBasePath: path.join(process.cwd(), "content"),
            })
          ),
          env: TE.right(env),
        }),
        TE.mapLeft((e) => ({
          ...e,
          name: e.name,
          status: 500,
        }))
      )
    ),
    TE.fold(
      (err) => {
        serverLogger.error.log(
          "An error occured during server startup %O",
          err
        );
        return () => Promise.reject(err);
      },
      (ctx) => {
        const app = express();

        app.use(cors(corsOptions) as any);
        app.use(express.json({ limit: 1024 * 5 * 1000 }));

        const mediaPath = path.resolve(__dirname, "../data");
        app.use(express.static(mediaPath));

        const router = express.Router();

        // pages
        MakePageRoutes(router, ctx);

        // groups
        MakeGroupRoutes(router, ctx);

        // actors
        MakeActorRoutes(router, ctx);

        // projects
        MakeProjectRoutes(router, ctx);

        // articles
        MakeArticlesRoutes(router, ctx);

        // graphs data
        MakeGraphsRoute(router, ctx);

        app.use("/v1", router);

        app.use((err: any, req: any, res: any, next: any) => {
          // eslint-disable-next-line no-console
          serverLogger.error.log(`An error occured %O`, JSON.stringify(err));
          if (err?.details?.kind !== undefined) {
            const { status, ...coreError } = fromIOError(err as IOError);
            return res.status(status).send(coreError);
          }
          res.status(500).send("Something broke!");
        });
        const server = app.listen(ctx.env.API_PORT, () =>
          serverLogger.info.log("Server is listening at 4010")
        );

        process.on("disconnect", () => {
          // eslint-disable-next-line no-console
          console.log("closing server...");
          server.close();
        });

        return () => Promise.resolve(undefined);
      }
    )
  )();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
  // eslint-disable-next-line
  .then((r) => console.log(r))
  // eslint-disable-next-line
  .catch((e) => console.error(e));
