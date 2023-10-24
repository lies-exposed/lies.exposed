import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createEventNetworkGraph } from "@flows/networks/createEventNetworkGraph.flow";
import { createNetworkGraph, emptyGetNetworkQuery } from "@flows/networks/createNetworkGraph.flow";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const MakeEditNetworkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Networks.Edit, ({ params: { type, id }, query }) => {
    const getCreateNetworkT = (
      type: NetworkType,
    ): TE.TaskEither<ControllerError, NetworkGraphOutput> => {
      switch (type) {
        case "events": {
          return createEventNetworkGraph(ctx)(id);
        }
      }

      return createNetworkGraph(ctx)(type, [id], emptyGetNetworkQuery);
    };

    return pipe(
      getCreateNetworkT(type),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
