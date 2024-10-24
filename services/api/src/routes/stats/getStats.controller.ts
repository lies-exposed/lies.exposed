import * as fs from "fs";
import path from "path";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { createStats } from "#flows/stats/createStats.flow.js";
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
        return createStats(type, id)(ctx);
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
