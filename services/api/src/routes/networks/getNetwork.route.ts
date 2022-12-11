import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createNetworkGraph } from "@flows/networks/createNetworkGraph.flow";
import { RouteContext } from "@routes/route.types";

export const MakeGetNetworkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Networks.Get, ({ params: { id, type }, query }) => {
    return pipe(
      createNetworkGraph(ctx)(type, id, query),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
