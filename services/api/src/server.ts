import * as path from "path";
import * as logger from "@econnessione/core/logger";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetJWTClient } from "@providers/jwt/JWTClient";
import { GetMDXClient } from "@providers/mdx";
import { GetTypeORMClient } from "@providers/orm";
import { S3Client } from "@providers/space";
import { GetFSClient } from "@providers/space/FSClient";
import { MakeGroupMemberRoutes } from "@routes/GroupMember/GroupMember.route";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAreasRoutes } from "@routes/areas/Areas.routes";
import { MakeArticlesRoutes } from "@routes/articles/articles.route";
import { MakeDeathEventsRoutes } from "@routes/events/deaths/death.routes";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakeGraphsRoute } from "@routes/graphs/getGraph.controller";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { RouteContext } from "@routes/route.types";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller.ts";
import { getDBOptions } from "@utils/getDBOptions";
import * as AWS from "aws-sdk";
import cors from "cors";
import express from "express";
import jwt from "express-jwt";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
import { MakeUserRoutes } from "./routes/users/User.routes";

// var whitelist = ["http://localhost:8002"]
const corsOptions: cors.CorsOptions = {
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
      return sequenceS(TE.taskEither)({
        logger: TE.right(serverLogger),
        db: GetTypeORMClient(getDBOptions(env)),
        s3:
          env.NODE_ENV === "development" || env.NODE_ENV === "test"
            ? TE.right(
                GetFSClient({
                  basePath: process.cwd(),
                  dataFolder: "data/media",
                  baseUrl: `http://localhost:${env.API_PORT}`,
                  logger: serverLogger,
                })
              )
            : TE.right(
                S3Client.GetS3Client({
                  endpoint: new AWS.Endpoint(
                    `${env.SPACE_REGION}.digitaloceanspaces.com`
                  ),
                  region: env.SPACE_REGION,
                  credentials: {
                    accessKeyId: env.SPACE_ACCESS_KEY_ID,
                    secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
                  },
                  signatureVersion: "v4",
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
  // uploads
  MakeUploadFileRoute(app, ctx);

  app.use(express.json({ limit: 1024 * 1000 }));
  app.use(
    jwt({ secret: ctx.env.JWT_SECRET, algorithms: ["HS256"] }).unless({
      path: [
        { url: "/v1/users/login", method: "POST" },
        { url: /\/v1\/*/, method: "GET" },
        { url: /\/v1\/uploads*\//, method: "PUT" },
        { url: /\/media\/*/ },
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

  // areas
  MakeAreasRoutes(router, ctx);

  // projects
  MakeProjectRoutes(router, ctx);

  // project images
  MakeProjectImageRoutes(router, ctx);

  // articles
  MakeArticlesRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);
  MakeDeathEventsRoutes(router, ctx);

  // graphs data
  MakeGraphsRoute(router, ctx);

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
