import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { AdminEdit } from "@liexp/shared/lib/io/http/User";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createFlowGraph } from "@flows/graphs/createFlowGraph.flow";
import { regenerateFlowGraph } from "@flows/graphs/regenerateFlowGraph.flow";
import { emptyGetNetworkQuery } from "@flows/networks/createNetworkGraph.flow";
import { type RouteContext } from "@routes/route.types";
import { RequestDecoder } from "@utils/authenticationHandler";

export const MakeEditFlowGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.EditFlowGraph,
    ({ params: { type, id }, body: { regenerate } }, req) => {
      return pipe(
        RequestDecoder.decodeNullableUser(ctx)(req, [AdminEdit.value]),
        TE.fromIO,
        TE.chain((user) => {
          const isAdmin = !!user;
          return regenerate
            ? regenerateFlowGraph(ctx)(type, id, isAdmin)
            : createFlowGraph(ctx)(type, id, emptyGetNetworkQuery, isAdmin);
        }),
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
