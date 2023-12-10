import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type FlowGraphOutput,
  type FlowGraphType,
} from "@liexp/shared/lib/io/http/graphs/FlowGraph";
import { type TEFlow } from "../flow.types.js";
import { createFlowGraph, getFilePath } from "./createFlowGraph.flow.js";

const deleteFlowGraph: TEFlow<[FlowGraphType, UUID], void> =
  (ctx) => (type, id) => {
    return pipe(getFilePath(ctx)(type, id), ctx.fs.deleteObject);
  };

export const regenerateFlowGraph: TEFlow<
  [FlowGraphType, UUID, boolean],
  FlowGraphOutput
> = (ctx) => (type, id, isAdmin) => {
  return pipe(
    deleteFlowGraph(ctx)(type, id),
    fp.TE.chain(() =>
      createFlowGraph(ctx)(
        type,
        id,
        {
          ids: fp.O.none,
          startDate: fp.O.none,
          endDate: fp.O.none,
          relations: fp.O.some(["actors", "groups", "keywords"]),
          groups: fp.O.none,
          actors: fp.O.none,
          keywords: fp.O.none,
          emptyRelations: fp.O.none,
        },
        isAdmin,
      ),
    ),
  );
};
