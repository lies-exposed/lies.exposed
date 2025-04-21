import * as fs from "fs";
import * as path from "path";
import { CreateEntityStatsPubSub } from "@liexp/backend/lib/pubsub/stats/createEntityStats.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Stats.List, ({ query: { id, type } }) => {
    const filePath = path.resolve(
      ctx.config.dirs.temp.root,
      `stats/${type}/${id}.json`,
    );

    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          const statsExists = fs.existsSync(filePath);
          ctx.logger.debug.log(
            "Stats path %s exists? %s",
            filePath,
            statsExists,
          );
          return statsExists;
        }, toControllerError),
      ),
      TE.chain((statsExist) => {
        if (statsExist) {
          return TE.fromIOEither(
            IOE.tryCatch(() => {
              ctx.logger.debug.log("Reading content from %s", filePath);
              const content = fs.readFileSync(filePath, "utf-8");
              return JSON.parse(content);
            }, toControllerError),
          );
        }
        return pipe(
          CreateEntityStatsPubSub.publish({ type, id })(ctx),
          TE.mapLeft(toControllerError),
          TE.map(() => ({})),
        );
      }),
      TE.map((data) => ({
        body: {
          data: [data],
          total: 1,
        },
        statusCode: 200,
      })),
    );
  });
};
