import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { AdminRead } from "@liexp/shared/lib/io/http/User";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createEventNetworkGraph } from "@flows/networks/createEventNetworkGraph.flow";
import {
  createNetworkGraph,
  emptyGetNetworkQuery,
} from "@flows/networks/createNetworkGraph.flow";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";
import { RequestDecoder } from "@utils/authenticationHandler";

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

        return createNetworkGraph(ctx)(type, [id], emptyGetNetworkQuery, isAdmin);
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
