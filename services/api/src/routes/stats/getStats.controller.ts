import * as path from "path";
import { CreateEntityStatsPubSub } from "@liexp/backend/lib/pubsub/stats/createEntityStats.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Stats.List, ({ query: { id, type } }) => {
    return pipe(
      TE.Do,
      TE.apS(
        "filePath",
        TE.right(
          ctx.fs.resolve(
            path.resolve(ctx.config.dirs.temp.root, `stats/${type}/${id}.json`),
          ),
        ),
      ),
      TE.bind("exists", ({ filePath }) => ctx.fs.objectExists(filePath)),
      TE.chain(({ filePath, exists }) => {
        if (exists) {
          return pipe(ctx.fs.getObject(filePath), TE.map(JSON.parse));
        }
        return pipe(
          CreateEntityStatsPubSub.publish({ type, id })(ctx),
          TE.mapLeft(toControllerError),
          TE.map(() => ({ actors: {}, groups: {}, keywords: {} })),
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
