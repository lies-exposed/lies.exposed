import { fp } from "@liexp/core/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/io/http/Network";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types";
import { createEventNetworkGraph } from "@flows/networks/createEventNetworkGraph.flow";
import { createNetworkGraph } from "@flows/networks/createNetworkGraph.flow";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const MakeGetNetworkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Networks.Get, ({ params: { type }, query }) => {
    const getCreateNetworkT = (
      type: NetworkType
    ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
      switch (type) {
        case "events": {
          const { ids } = query;
          if (fp.O.isSome(ids)) {
            if (ids.value[0]) {
              return createEventNetworkGraph(ctx)(ids.value[0], query);
            }
          }
          break;
        }
      }

      return createNetworkGraph(ctx)(
        type,
        pipe(
          query.ids,
          fp.O.getOrElse((): UUID[] => [])
        ),
        query
      );
    };
    return pipe(
      getCreateNetworkT(type),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
