import * as fs from "fs";
import path from "path";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
import { createStatsByEntityType } from "@flows/stats/createStatsByEntityType.flow";
import { toControllerError } from "@io/ControllerError";

export const MakeGetStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Stats.List, ({ query: { id, type } }) => {
    const filePath = path.resolve(
      process.cwd(),
      `temp/stats/${type}/${id}.json`
    );

    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          const statsExists = fs.existsSync(filePath);
          ctx.logger.debug.log(
            "Stats path %s exists? %s",
            filePath,
            statsExists
          );
          return statsExists;
        }, toControllerError)
      ),
      TE.chain((statsExist) => {
        if (statsExist) {
          return TE.fromIOEither(
            IOE.tryCatch(() => {
              ctx.logger.debug.log('Reading content from %s', filePath);
              const content = fs.readFileSync(filePath, "utf-8");
              return JSON.parse(content);
            }, toControllerError)
          );
        }
        return createStatsByEntityType(ctx)(type, id);
      }),
      TE.map((data) => ({
        body: {
          data: [data],
          total: 1,
        },
        statusCode: 200,
      }))
    );
  });
};
