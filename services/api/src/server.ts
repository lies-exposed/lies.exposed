/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias")(process.cwd());
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as fs from "fs";
import * as path from "path";
import { logger } from "@econnessione/core";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { fromIOError } from "@io/APIError";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetMDXClient } from "@providers/mdx";
import { GetTypeORMClient } from "@providers/orm";
import { S3Client } from "@providers/space";
import { GetFSClient } from "@providers/space/FSClient";
import { MakeGroupMemberRoutes } from "@routes/GroupMember/GroupMember.route";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { ArticleEntity } from "@routes/articles/article.entity";
import { MakeArticlesRoutes } from "@routes/articles/articles.route";
import { EventLinkEntity } from "@routes/events/EventLink.entity";
import { EventEntity } from "@routes/events/event.entity";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakeGraphsRoute } from "@routes/graphs/getGraph.controller";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { PageEntity } from "@routes/pages/page.entity";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { ProjectEntity } from "@routes/projects/project.entity";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { RouteContext } from "@routes/route.types";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
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
import { EventImageEntity } from "./routes/events/EventImage.entity";

// var whitelist = ["http://localhost:8002"]
var corsOptions: cors.CorsOptions = {
  origin: true,
};

export const makeContext = (
  processENV: unknown
): TE.TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");
  return pipe(
    ENV.decode(processENV),
    serverLogger.debug.logInPipe("Decoded env result %O"),
    E.mapLeft(DecodeError),
    TE.fromEither,
    TE.chain((env) =>
      sequenceS(TE.taskEither)({
        logger: TE.right(serverLogger),
        db: GetTypeORMClient({
          type: "postgres",
          host: env.DB_HOST,
          username: env.DB_USERNAME,
          password: env.DB_PASSWORD,
          database: env.DB_DATABASE,
          port: env.DB_PORT,
          entities: [
            PageEntity,
            ActorEntity,
            GroupEntity,
            GroupMemberEntity,
            ArticleEntity,
            ProjectEntity,
            EventEntity,
            EventImageEntity,
            EventLinkEntity,
          ],
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
          env.NODE_ENV === "development" || env.NODE_ENV === "test"
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
      })
    ),
    TE.mapLeft((e) => ({
      ...e,
      name: e.name,
      status: 500,
    }))
  );
};

export const makeApp = (ctx: RouteContext): express.Express => {
  const app = express();

  app.use(cors(corsOptions) as any);
  app.use(express.json({ limit: 1024 * 1000 }));

  const mediaPath = path.resolve(__dirname, "../data");
  app.use(express.static(mediaPath));

  const router = express.Router();

  // pages
  MakePageRoutes(router, ctx);

  // groups
  MakeGroupRoutes(router, ctx);
  MakeGroupMemberRoutes(router, ctx);

  // actors
  MakeActorRoutes(router, ctx);

  // projects
  MakeProjectRoutes(router, ctx);

  // articles
  MakeArticlesRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);

  // graphs data
  MakeGraphsRoute(router, ctx);

  // uploads
  MakeUploadsRoutes(router, ctx);

  // errors

  app.use("/v1", router,  (err: any, req: any, res: any) => {
    // eslint-disable-next-line no-console
    console.log("error", err);
    if (err.details.kind === "DecodingError") {
      const errors = PathReporter.report(E.left(err.details.meta.errors));
      ctx.logger.error.log(`An error occured %O`, errors);
      return res.status(500).send({
        name: "DecodingError",
        details: errors,
      });
    }

    if (err.details.kind === "ServerError") {
      if (err.details.meta.kind === "DecodingError") {
        const errors = PathReporter.report(E.left(err.details.meta.errors));
        ctx.logger.error.log(`An error occured %O`, errors);
        return res.status(500).send({
          name: "DecodingError",
          details: errors,
        });
      }
    }
    if (err?.details?.kind !== undefined) {
      const { status, ...coreError } = fromIOError(err as IOError);
      return res.status(status).send(coreError);
    }

    if (err.name === "APIError") {
      ctx.logger.error.log("APIError %O", JSON.stringify(err, null, 2));
      return res
        .status(err.status)
        .send({ message: err.message, details: err.details });
    }

    ctx.logger.error.log(`An error occured %O`, JSON.stringify(err, null, 2));

    res.status(500).send(err);
  });


  return app;
};
