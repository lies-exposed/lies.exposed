import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createEventNetworkGraph } from "#flows/networks/createEventNetworkGraph.flow.js";
import {
  createNetworkGraph,
  emptyGetNetworkQuery,
} from "#flows/networks/createNetworkGraph.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type Route } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeEditNetworkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Networks.Edit,
    ({ params: { type, id }, query }, req) => {
      const getCreateNetworkT = (
        type: NetworkType,
        isAdmin: boolean,
      ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
        switch (type) {
          case "events": {
            return createEventNetworkGraph(id, isAdmin)(ctx);
          }
        }

        return createNetworkGraph(
          type,
          [id],
          emptyGetNetworkQuery,
          isAdmin,
        )(ctx);
      };

      return pipe(
        RequestDecoder.decodeNullableUser(req, [AdminRead.value])(ctx),
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
