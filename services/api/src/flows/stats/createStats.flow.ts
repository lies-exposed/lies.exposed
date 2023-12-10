import path from "path";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { createStatsByType } from "./createStatsByType.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export const createStats: TEFlow<
  ["keywords" | "groups" | "actors", string],
  any
> = (ctx) => (type, id) => {
  const filePath = path.resolve(
    ctx.config.dirs.temp.root,
    `stats/${type}/${id}.json`,
  );

  ctx.logger.debug.log("%s stats file %s", filePath);

  return pipe(
    createStatsByType(ctx)(id, type),
    ctx.fs.getOlderThanOr(filePath),
  );
};
