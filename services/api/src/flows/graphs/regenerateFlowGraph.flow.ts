import { fp } from "@liexp/core/lib/fp";
import {
  type FlowGraphOutput,
  type FlowGraphType
} from "@liexp/shared/lib/io/http/graphs/FlowGraph";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { type TEFlow } from "../flow.types";
import { createFlowGraph, getFilePath } from './createFlowGraph.flow';


const deleteFlowGraph: TEFlow<[FlowGraphType, UUID], void> =
  (ctx) => (type, id) => {
    return pipe(getFilePath(ctx)(type, id), ctx.fs.deleteObject);
  };



export const regenerateFlowGraph: TEFlow<[FlowGraphType, UUID, boolean], FlowGraphOutput> = (ctx) => (type, id, isAdmin) => {
  return pipe(
    deleteFlowGraph(ctx)(type, id),
    fp.TE.chain(() => createFlowGraph(ctx)(type, id, {
      ids: fp.O.none,
      startDate: fp.O.none,
      endDate: fp.O.none,
      relations: fp.O.some(["actors", "groups", "keywords"]),
      groups: fp.O.none,
      actors: fp.O.none,
      keywords: fp.O.none,
      emptyRelations: fp.O.none,
    }, isAdmin)
    )
  );
};
