import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { createFlowGraph } from "#flows/graphs/createFlowGraph.flow.js";
import { type RouteContext } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetFlowGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Custom.GetGraphByType,
    ({ params: { id, type }, query }, req) => {
      return pipe(
        RequestDecoder.decodeNullableUser(ctx)(req, []),
        TE.fromIO,
        TE.chain((user) =>
          createFlowGraph(ctx)(
            type,
            id,
            query,
            user ? checkIsAdmin(user.permissions) : false,
          ),
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
