/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias")(process.cwd());
import "reflect-metadata";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as fs from "fs";
import * as path from "path";
import { logger } from "@econnessione/core";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
// import { fromIOError } from "@io/APIError";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetJWTClient } from "@providers/jwt/JWTClient";
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
import { UserEntity } from "@routes/users/User.entity";
import * as AWS from "aws-sdk";
import cors from "cors";
import express from "express";
import jwt from "express-jwt";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
// import { IOError } from "ts-shared/lib/errors";
import { EventImageEntity } from "./routes/events/EventImage.entity";
import { MakeUserRoutes } from "./routes/users/User.routes";

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
    TE.chain((env) => {
      const ssl =
        env.DB_SSL_MODE === "require"
          ? {
              ca: fs.readFileSync(
                path.join(process.cwd(), env.DB_SSL_CERT_PATH),
                {
                  encoding: "utf-8",
                }
              ),
            }
          : false;

      serverLogger.debug.log("SSL configuration %O", ssl);

      return sequenceS(TE.taskEither)({
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
            UserEntity,
          ],
          synchronize: true,
          ssl: ssl,
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
        jwt: TE.right(
          GetJWTClient({ secret: env.JWT_SECRET, logger: serverLogger })
        ),
        env: TE.right(env),
      });
    }),
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
  app.use(
    jwt({ secret: ctx.env.JWT_SECRET, algorithms: ["HS256"] }).unless({
      path: [
        { url: "/v1/users/login", method: "POST" },
        { url: "/v1/users", method: "POST" },
        { url: "/v1/pages", method: "GET" },
        { url: "/v1/graphs/:graphId", method: "GET" },
        { url: "/v1/graphs", method: "GET" },
      ],
    })
  );
  const mediaPath = path.resolve(__dirname, "../data");
  app.use(express.static(mediaPath));

  const router = express.Router();

  // users
  MakeUserRoutes(router, ctx);

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

  app.use("/v1", router);

  app.use(function (err: any, req: any, res: any, next: any) {
    // eslint-disable-next-line no-console
    ctx.logger.debug.log("An error occured %O", err);
    try {
      if (err) {
        if (err.details?.kind === "DecodingError") {
          const errors = PathReporter.report(E.left(err.details.errors));
          ctx.logger.debug.log(`Sending errors... %O`, errors);
          ctx.logger.debug.log(`An error occured %O`, errors);
          return res.status(400).send({
            name: "DecodingError",
            details: errors,
          });
        }
        if (err.name === "UnauthorizedError") {
          return res.status(err.status).send(err);
        }

        ctx.logger.debug.log("An error occured %O", err);
        ctx.logger.debug.log("Error kind %s", err.details.kind);
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

        if (err.name === "APIError") {
          ctx.logger.error.log("APIError %O", JSON.stringify(err, null, 2));
          return res
            .status(err.status)
            .send({ message: err.message, details: err.details });
        }
      }
      return res.status(err.status ?? 500).send(err);
    } catch (e) {
      ctx.logger.error.log(`An error occured %O`, JSON.stringify(err, null, 2));
      return res.status(500).send(err);
    }
  });

  return app;
};
