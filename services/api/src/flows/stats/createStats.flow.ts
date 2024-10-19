import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { createStatsByType } from "./createStatsByType.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";

export const createStats = (
  type: "keywords" | "groups" | "actors",
  id: string,
): TEReader<any> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
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
