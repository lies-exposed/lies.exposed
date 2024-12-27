import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type WorkerContext } from "../../context/context.js";
import { type RTE } from "../../types.js";
import { createStatsByType } from "./createStatsByType.flow.js";

export const createEntityStats = (
  type: "keywords" | "groups" | "actors",
  id: string,
): RTE<any> => {
  return pipe(
    fp.RTE.ask<WorkerContext>(),
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
