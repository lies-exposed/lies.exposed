import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createFlowGraph } from "#flows/graphs/createFlowGraph.flow.js";
import { regenerateFlowGraph } from "#flows/graphs/regenerateFlowGraph.flow.js";
import { emptyGetNetworkQuery } from "#flows/networks/createNetworkGraph.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeEditFlowGraphRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.EditFlowGraph,
    ({ params: { type, id }, body: { regenerate } }, req) => {
      return pipe(
        RequestDecoder.decodeNullableUser(req, [AdminEdit.Type])(ctx),
        TE.fromIO,
        TE.chain((user) => {
          const isAdmin = !!user;
          return regenerate
            ? regenerateFlowGraph(type, id, isAdmin)(ctx)
            : createFlowGraph(type, id, emptyGetNetworkQuery, isAdmin)(ctx);
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
