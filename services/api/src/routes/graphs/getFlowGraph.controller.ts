import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createFlowGraph } from "#flows/graphs/createFlowGraph.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetFlowGraphRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.GetGraphByType,
    ({ params: { id, type }, query }, req) => {
      return pipe(
        RequestDecoder.decodeNullableUser(req, [])(ctx),
        TE.fromIO,
        TE.chain((user) =>
          createFlowGraph(
            type,
            id,
            query,
            user ? checkIsAdmin(user.permissions) : false,
          )(ctx),
        ),
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
