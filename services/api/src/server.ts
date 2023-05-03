import * as path from "path";
import * as logger from "@liexp/core/lib/logger";
import { MakeURLMetadata } from "@liexp/shared/lib/providers/URLMetadata.provider";
import { GetFFMPEGProvider } from "@liexp/shared/lib/providers/ffmpeg.provider";
import { GetFSClient } from "@liexp/shared/lib/providers/fs/fs.provider";
import { HTTP } from "@liexp/shared/lib/providers/http/http.provider";
import { IGProvider } from "@liexp/shared/lib/providers/ig/ig.provider";
import { GetJWTClient } from "@liexp/shared/lib/providers/jwt/JWTClient";
import { GetTypeORMClient } from "@liexp/shared/lib/providers/orm";
import { GetPuppeteerProvider } from "@liexp/shared/lib/providers/puppeteer.provider";
import { S3Client } from "@liexp/shared/lib/providers/space";
import { TGBotProvider } from "@liexp/shared/lib/providers/tg/tg.provider";
import { WikipediaProvider } from "@liexp/shared/lib/providers/wikipedia/wikipedia.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
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
import metadataParser from "page-metadata-parser";
import puppeteer from "puppeteer-core";
import wk from "wikipedia";
import { createFromTGMessage } from "@flows/event-suggestion/createFromTGMessage.flow";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type ENV } from "@io/ENV";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAdminRoutes } from "@routes/admins/admin.routes";
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
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakeGroupMemberRoutes } from "@routes/groups-members/GroupMember.route";
import { MakeHealthcheckRoutes } from "@routes/healthcheck/healthcheck.routes";
import { MakeKeywordRoutes } from "@routes/keywords/keywords.routes";
import { MakeLinkRoutes } from "@routes/links/LinkRoute.route";
import { MakeMediaRoutes } from "@routes/media/media.routes";
import { MakeNetworksRoutes } from "@routes/networks/networks.routes";
import { MakeOpenGraphRoutes } from "@routes/open-graph/openGraph.routes";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { type RouteContext } from "@routes/route.types";
import { MakeStatsRoutes } from "@routes/stats/stats.routes";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller";
import { MakeUserRoutes } from "@routes/users/User.routes";
import { getDataSource } from "@utils/data-source";
import { GetWriteJSON } from "@utils/json.utils";

// var whitelist = ["http://localhost:8002"]
const corsOptions: cors.CorsOptions = {
  origin: true,
};

export const makeContext = (
  env: ENV
): TE.TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");

  const s3 =
    env.NODE_ENV === "development" || env.NODE_ENV === "test"
      ? S3Client.GetS3Client({
          endpoint: env.DEV_DATA_HOST,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: true,
          forcePathStyle: true,
        })
      : S3Client.GetS3Client({
          endpoint: `https://${env.SPACE_REGION}.digitaloceanspaces.com`,
          region: env.SPACE_REGION,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: true,
        });

  const wpProvider = WikipediaProvider({
    logger: logger.GetLogger("mw"),
    client: wk,
  });

  return pipe(
    sequenceS(TE.ApplicativePar)({
      logger: TE.right(serverLogger),
      db: pipe(
        GetTypeORMClient(getDataSource(env, false)),
        TE.mapLeft(toControllerError)
      ),
      s3: TE.right(s3),
      fs: TE.right(GetFSClient()),
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
        TGBotProvider(serverLogger, {
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
      wp: TE.right(wpProvider),
      ig: TE.right(
        IGProvider({
          logger: logger.GetLogger("ig"),
          credentials: { username: env.IG_USERNAME, password: env.IG_PASSWORD },
        })
      ),
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    jwt({ secret: ctx.env.JWT_SECRET, algorithms: ["HS256"] }).unless({
      path: [
        { url: "/v1/links/submit", method: "POST" },
        { url: "/v1/users/login", method: "POST" },
        { url: "/v1/users/signup", method: "POST" },
        { url: /\/v1\/*/, method: "GET" },
        { url: /\/v1\/uploads*\//, method: "PUT" },
        { url: "/v1/events/suggestions", method: "POST" },
        { url: /\/v1\/events\/suggestions*\//, method: "PUT" },
        { url: /\/media\/*/ },
      ],
    })
  );

  // const mediaPath = path.resolve(__dirname, "../data");
  // app.use(express.static(mediaPath));

  const router = express.Router();

  // healthcheck
  MakeHealthcheckRoutes(router, ctx);

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

  // networks
  MakeNetworksRoutes(router, ctx);

  // uploads
  MakeUploadsRoutes(router, ctx);

  // admins
  MakeAdminRoutes(router, ctx);

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
      TE.map(({ eventSuggestion, storeMsg }) => {
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
        return message.join("\n");
      }),
      throwTE
    )
      .then((message) =>
        ctx.tg.bot.sendMessage(msg.chat.id, message, {
          reply_to_message_id: msg.message_id,
        })
      )
      .catch((e) => {
        tgLogger.error.log("Error %O", e);
      });
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
        if (err.name === "UnauthorizedError") {
          return res.status(err.status).send(err);
        }

        if (err.name === "DBError") {
          return res.status(500).send({
            name: "APIError",
            message: err.message,
            details: [...err.details.meta],
          });
        }

        if (err.details?.kind === "DecodingError") {
          const errors = PathReporter.report(E.left(err.details.errors));
          ctx.logger.error.log(`DecodingError %O`, errors);
          return res.status(400).send({
            name: "DecodingError",
            details: errors,
          });
        }

        ctx.logger.debug.log("An error occurred %O", err);
        ctx.logger.debug.log("Error kind %s", err.details.kind);
        if (err.details.kind === "ServerError") {
          if (err.details.meta.kind === "DecodingError") {
            const errors = PathReporter.report(E.left(err.details.meta.errors));
            ctx.logger.error.log(`An error occurred %O`, errors);
            return res.status(500).send({
              ...err,
              name: "APIError",
              details: ["DecodingError", errors],
            });
          }
        }

        if (err.name === "APIError") {
          ctx.logger.error.log("APIError %O", JSON.stringify(err, null, 2));
          return res.status(err.status).send({
            name: "APIError",
            message: err.message,
            details: err.details,
          });
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
