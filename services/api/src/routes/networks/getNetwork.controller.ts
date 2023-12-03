import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { AdminRead } from "@liexp/shared/lib/io/http/User";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { createEventNetworkGraph } from "@flows/networks/createEventNetworkGraph.flow";
import { createNetworkGraph } from "@flows/networks/createNetworkGraph.flow";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";
import { RequestDecoder } from "@utils/authenticationHandler";

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
