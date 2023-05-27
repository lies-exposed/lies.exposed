import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createFlowGraph } from '@flows/graphs/createFlowGraph.flow';
import { type RouteContext } from "@routes/route.types";

export const MakeGetFlowGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.GetGraphByType,
    ({ params: { id, type }, query }) => {

      return pipe(
        createFlowGraph(ctx)(id, type, query),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
