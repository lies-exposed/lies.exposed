import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { createStatsByType } from "./createStatsByType.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOlderThanOr } from "#flows/fs/getOlderThanOr.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const createStats = (
  type: "keywords" | "groups" | "actors",
  id: string,
): TEReader<any> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chain((ctx) => {
      const filePath = path.resolve(
        ctx.config.dirs.temp.root,
        `stats/${type}/${id}.json`,
      );

      ctx.logger.debug.log("%s stats file %s", filePath);

      return getOlderThanOr(filePath)(createStatsByType(id, type));
    }),
  );
};
