import * as fs from "fs";
import path from "path";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Route } from "../route.types";
import { createStats } from '@flows/stats/createStats.flow';
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
        return createStats(ctx)(type, id);
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
