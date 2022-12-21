import * as path from "path";
import * as logger from "@liexp/core/logger";
import { MakeURLMetadata } from "@liexp/shared/providers/URLMetadata.provider";
import { GetFFMPEGProvider } from "@liexp/shared/providers/ffmpeg.provider";
import { HTTP } from "@liexp/shared/providers/http/http.provider";
import { GetJWTClient } from "@liexp/shared/providers/jwt/JWTClient";
import { GetTypeORMClient } from "@liexp/shared/providers/orm";
import { GetPuppeteerProvider } from "@liexp/shared/providers/puppeteer.provider";
import { S3Client } from "@liexp/shared/providers/space";
import { TGBotProvider } from "@liexp/shared/providers/tg/tg.provider";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as AWS from "aws-sdk";
import axios from "axios";
import cors from "cors";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import TelegramBot from "node-telegram-bot-api";
import metadataParser from "page-metadata-parser";
import puppeteer from "puppeteer-core";
import { createFromTGMessage } from "@flows/event-suggestion/createFromTGMessage.flow";
import { upsertPinnedMessage } from "@flows/tg/upsertPinnedMessage.flow";
import {
  ControllerError,
  DecodeError,
  toControllerError,
} from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAreasRoutes } from "@routes/areas/Areas.routes";
import { MakeArticlesRoutes } from "@routes/articles/articles.route";
import { MakeDeathEventsRoutes } from "@routes/events/deaths/death.routes";
import { MakeDocumentaryReleaseRoutes } from "@routes/events/documentary/documentary.routes";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakePatentEventsRoutes } from "@routes/events/patents/patent.routes";
import { MakeQuoteRoutes } from "@routes/events/quotes/quote.routes";
import { MakeScientificStudyRoutes } from "@routes/events/scientific-study/ScientificStudyRoute.route";
import { MakeTransactionEventsRoutes } from "@routes/events/transactions/transaction.routes";
import { MakeGraphsRoute } from "@routes/graphs/getGraph.controller";
import { MakeGroupMemberRoutes } from "@routes/groups-members/GroupMember.route";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakeKeywordRoutes } from "@routes/keywords/keywords.routes";
import { MakeLinkRoutes } from "@routes/links/LinkRoute.route";
import { MakeMediaRoutes } from "@routes/media/media.routes";
import { MakeOpenGraphRoutes } from "@routes/open-graph/openGraph.routes";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { RouteContext } from "@routes/route.types";
import { MakeStatsRoutes } from "@routes/stats/stats.routes";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller.ts";
import { MakeUserRoutes } from "@routes/users/User.routes";
import { getDataSource } from "@utils/data-source";
import { GetWriteJSON } from "@utils/json.utils";

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
      const s3 =
        env.NODE_ENV === "development" || env.NODE_ENV === "test"
          ? S3Client.GetS3Client({
              endpoint: new AWS.Endpoint(env.DEV_DATA_HOST),
              credentials: {
                accessKeyId: env.SPACE_ACCESS_KEY_ID,
                secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
              },
              sslEnabled: false,
              s3ForcePathStyle: true,
              signatureVersion: "v4",
            })
          : S3Client.GetS3Client({
              endpoint: new AWS.Endpoint(
                `${env.SPACE_REGION}.digitaloceanspaces.com`
              ),
              region: env.SPACE_REGION,
              credentials: {
                accessKeyId: env.SPACE_ACCESS_KEY_ID,
                secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
              },
              signatureVersion: "v4",
            });
      return sequenceS(TE.ApplicativePar)({
        logger: TE.right(serverLogger),
        db: pipe(
          GetTypeORMClient(getDataSource(env, false)),
          TE.mapLeft(toControllerError)
        ),
        s3: TE.right(s3),
        jwt: TE.right(
          GetJWTClient({ secret: env.JWT_SECRET, logger: serverLogger })
        ),
        urlMetadata: TE.right(
          MakeURLMetadata({
            client: axios,
            parser: {
              getMetadata: metadataParser.getMetadata,
            },
          })
        ),
        env: TE.right(env),
        tg: TE.right(
          TGBotProvider({
            token: env.TG_BOT_TOKEN,
            chat: env.TG_BOT_CHAT,
            polling: env.TG_BOT_POLLING,
          })
        ),
        puppeteer: TE.right(
          GetPuppeteerProvider(puppeteer as any, {
            headless: true,
            args: ["--no-sandbox"],
          })
        ),
        ffmpeg: TE.right(GetFFMPEGProvider(ffmpeg)),
        http: TE.right(HTTP({})),
      });
    }),
    TE.mapLeft((e) => ({
      ...e,
      name: e.name,
      status: 500,
    })),
    TE.chainFirst((ctx) =>
      pipe(
        upsertPinnedMessage(ctx)(20),
        TE.fold(
          (e) =>
            (): Promise<
              E.Either<ControllerError, Error | TelegramBot.Message>
            > =>
              Promise.resolve(E.right(e)),
          (a) => () => Promise.resolve(E.right(a))
        )
      )
    )
  );
};

export const makeApp = (ctx: RouteContext): express.Express => {
  const app = express();

  app.use(cors(corsOptions) as any);
  // uploads
  MakeUploadFileRoute(app, ctx);

  app.use(express.json({ limit: 1024 * 1000 }));
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    jwt({ secret: ctx.env.JWT_SECRET, algorithms: ["HS256"] }).unless({
      path: [
        { url: "/v1/users/login", method: "POST" },
        { url: /\/v1\/*/, method: "GET" },
        { url: /\/v1\/uploads*\//, method: "PUT" },
        { url: "/v1/events/suggestions", method: "POST" },
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

  // media
  MakeMediaRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);
  MakeDeathEventsRoutes(router, ctx);
  MakeScientificStudyRoutes(router, ctx);
  MakePatentEventsRoutes(router, ctx);
  MakeDocumentaryReleaseRoutes(router, ctx);
  MakeTransactionEventsRoutes(router, ctx);
  MakeQuoteRoutes(router, ctx);

  // links
  MakeLinkRoutes(router, ctx);
  MakeKeywordRoutes(router, ctx);

  // graphs data
  MakeGraphsRoute(router, ctx);

  // open graphs
  MakeOpenGraphRoutes(router, ctx);

  // stats
  MakeStatsRoutes(router, ctx);

  MakeUploadsRoutes(router, ctx);

  const tgLogger = ctx.logger.extend("tg-bot");

  ctx.tg.onMessage((msg, metadata) => {
    void pipe(
      sequenceS(TE.ApplicativePar)({
        storeMsg: GetWriteJSON(ctx.logger)(
          path.resolve(process.cwd(), `temp/tg/messages/${msg.message_id}.json`)
        )(msg),
        eventSuggestion: createFromTGMessage({ ...ctx, logger: tgLogger })(
          msg,
          metadata
        ),
      }),
      throwTE
    ).then(
      ({ eventSuggestion, storeMsg }) => {
        tgLogger.info.log("Success %O", eventSuggestion);
        const message = [
          "Thanks for your contribution! 🫶",
          "\n",
          `Links: ${
            eventSuggestion.link
              ? eventSuggestion.link.map((l) => `${l.url}\n`)
              : ""
          }`,
          `Photos: ${eventSuggestion.photos.length}`,
          `Videos: ${eventSuggestion.videos.length}`,
        ];
        void ctx.tg.bot.sendMessage(msg.chat.id, message.join("\n"), {
          reply_to_message_id: msg.message_id,
        });
      },
      (e) => tgLogger.error.log("Error %O", e)
    );
  });

  app.use("/v1", router);

  app.use(function (err: any, req: any, res: any, next: any) {
    // eslint-disable-next-line no-console
    try {
      ctx.logger.error.log(
        "An error occurred during %s %s %O",
        req.method,
        req.url,
        err
      );
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
        `An error occurred during %s %s: %O`,
        req.method,
        req.url,
        JSON.stringify(err, null, 2)
      );
      return res.status(500).send(err);
    }
  });

  return app;
};
