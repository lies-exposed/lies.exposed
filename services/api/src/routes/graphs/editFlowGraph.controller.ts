import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  createFlowGraph,
} from "@flows/graphs/createFlowGraph.flow";
import { regenerateFlowGraph } from '@flows/graphs/regenerateFlowGraph.flow';
import { emptyGetNetworkQuery } from '@flows/networks/createNetworkGraph.flow';
import { type RouteContext } from "@routes/route.types";

export const MakeEditFlowGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.EditFlowGraph,
    ({ params: { type, id }, body: { regenerate } }) => {

      return pipe(
        regenerate
          ? regenerateFlowGraph(ctx)(type, id)
          : createFlowGraph(ctx)(type, id, emptyGetNetworkQuery),

        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
