import * as path from "path";
import * as logger from "@econnessione/core/logger";
import { MakeURLMetadata } from "@econnessione/shared/providers/URLMetadata.provider";
import * as AWS from "aws-sdk";
import axios from "axios";
import cors from "cors";
import domino from "domino";
import express from "express";
import jwt from "express-jwt";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
import metadataParser from "page-metadata-parser";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetJWTClient } from "@providers/jwt/JWTClient";
import { GetTypeORMClient } from "@providers/orm";
import { S3Client } from "@providers/space";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAreasRoutes } from "@routes/areas/Areas.routes";
import { MakeArticlesRoutes } from "@routes/articles/articles.route";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakeGraphsRoute } from "@routes/graphs/getGraph.controller";
import { MakeGroupMemberRoutes } from "@routes/groups-members/GroupMember.route";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakeKeywordRoutes } from "@routes/keywords/keywords.routes";
import { MakeLinkRoutes } from "@routes/links/LinkRoute.route";
import { MakeMediaRoutes } from "@routes/media/media.routes";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { RouteContext } from "@routes/route.types";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller.ts";
import { MakeUserRoutes } from "@routes/users/User.routes";
import { getDBOptions } from "@utils/getDBOptions";

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
    E.mapLeft((e) => DecodeError(`Failed to decode process env`, e)),
    TE.fromEither,
    TE.chain((env) => {
      return sequenceS(TE.ApplicativePar)({
        logger: TE.right(serverLogger),
        db: GetTypeORMClient(getDBOptions(env)),
        s3:
          env.NODE_ENV === "development" || env.NODE_ENV === "test"
            ? TE.right(
                S3Client.GetS3Client({
                  endpoint: new AWS.Endpoint(env.DEV_DATA_HOST),
                  credentials: {
                    accessKeyId: env.SPACE_ACCESS_KEY_ID,
                    secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
                  },
                  sslEnabled: false,
                  s3ForcePathStyle: true,
                  signatureVersion: "v4",
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
        jwt: TE.right(
          GetJWTClient({ secret: env.JWT_SECRET, logger: serverLogger })
        ),
        urlMetadata: TE.right(
          MakeURLMetadata({
            client: axios,
            parser: {
              toDOM: (html) => domino.createWindow(html).document,
              getMetadata: metadataParser.getMetadata,
            },
          })
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

  MakeMediaRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);

  // links
  MakeLinkRoutes(router, ctx);
  MakeKeywordRoutes(router, ctx);

  // graphs data
  MakeGraphsRoute(router, ctx);

  MakeUploadsRoutes(router, ctx);
  // errors

  app.use("/v1", router);

  app.use(function (err: any, req: any, res: any, next: any) {
    // eslint-disable-next-line no-console
    try {
      ctx.logger.error.log("An error occurred %O", err);
      if (err) {
        if (err.details?.kind === "DecodingError") {
          const errors = PathReporter.report(E.left(err.details.errors));
          ctx.logger.error.log(`DecodingError %O`, errors);
          return res.status(400).send({
            name: "DecodingError",
            details: errors,
          });
        }
        if (err.name === "UnauthorizedError") {
          return res.status(err.status).send(err);
        }

        ctx.logger.debug.log("An error occurred %O", err);
        ctx.logger.debug.log("Error kind %s", err.details.kind);
        if (err.details.kind === "ServerError") {
          if (err.details.meta.kind === "DecodingError") {
            const errors = PathReporter.report(E.left(err.details.meta.errors));
            ctx.logger.error.log(`An error occurred %O`, errors);
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
      ctx.logger.error.log(
        `An error occurred %O`,
        JSON.stringify(err, null, 2)
      );
      return res.status(500).send(err);
    }
  });

  return app;
};
