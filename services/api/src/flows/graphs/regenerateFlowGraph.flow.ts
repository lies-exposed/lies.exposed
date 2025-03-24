import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type FlowGraphOutput,
  type FlowGraphType,
} from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import * as O from "effect/Option";
import { type TEReader } from "../flow.types.js";
import { createFlowGraph, getFilePath } from "./createFlowGraph.flow.js";

const deleteFlowGraph =
  (type: FlowGraphType, id: UUID): TEReader<void> =>
  (ctx) => {
    return pipe(getFilePath(type, id)(ctx), ctx.fs.deleteObject);
  };

export const regenerateFlowGraph = (
  type: FlowGraphType,
  id: UUID,
  isAdmin: boolean,
): TEReader<FlowGraphOutput> => {
  return pipe(
    deleteFlowGraph(type, id),
    fp.RTE.chain(() =>
      createFlowGraph(
        type,
        id,
        {
          ids: O.none(),
          startDate: O.none(),
          endDate: O.none(),
          relations: O.some(["actors", "groups", "keywords"]),
          groups: O.none(),
          actors: O.none(),
          keywords: O.none(),
          emptyRelations: O.none(),
        },
        isAdmin,
      ),
    ),
  );
};
