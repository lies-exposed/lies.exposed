import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createEventNetworkGraph } from "#flows/networks/createEventNetworkGraph.flow.js";
import { createNetworkGraph } from "#flows/networks/createNetworkGraph.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetNetworkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Networks.Get, ({ params: { type }, query }, req) => {
    const getCreateNetworkT = (
      type: NetworkType,
      isAdmin: boolean,
    ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
      switch (type) {
        case "events": {
          const ids = pipe(query.ids, fp.O.filter(fp.A.isNonEmpty));
          if (fp.O.isSome(ids)) {
            if (ids.value[0]) {
              return createEventNetworkGraph(ctx)(ids.value[0], isAdmin);
            }
          }
          break;
        }
      }

      const ids = pipe(
        query.ids,
        fp.O.getOrElse((): UUID[] => []),
      );

      return createNetworkGraph(ctx)(type, ids, query, isAdmin);
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
  });
};
