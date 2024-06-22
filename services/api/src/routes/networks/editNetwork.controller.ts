import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { createEventNetworkGraph } from "#flows/networks/createEventNetworkGraph.flow.js";
import {
  createNetworkGraph,
  emptyGetNetworkQuery,
} from "#flows/networks/createNetworkGraph.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeEditNetworkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Networks.Edit,
    ({ params: { type, id }, query }, req) => {
      const getCreateNetworkT = (
        type: NetworkType,
        isAdmin: boolean,
      ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
        switch (type) {
          case "events": {
            return createEventNetworkGraph(ctx)(id, isAdmin);
          }
        }

        return createNetworkGraph(ctx)(
          type,
          [id],
          emptyGetNetworkQuery,
          isAdmin,
        );
      };

      return pipe(
        RequestDecoder.decodeNullableUser(ctx)(req, [AdminRead.value]),
        TE.fromIO,
        TE.chain((user) => getCreateNetworkT(type, !!user)),
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
