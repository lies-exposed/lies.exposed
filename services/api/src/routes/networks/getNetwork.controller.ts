import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type NetworkGraphOutput,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEControllerError } from "../../types/TEControllerError.js";
import { createEventNetworkGraph } from "#flows/networks/createEventNetworkGraph.flow.js";
import { createNetworkGraph } from "#flows/networks/createNetworkGraph.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetNetworkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Networks.Get, ({ params: { type }, query }, req) => {
    const getCreateNetworkT = (
      type: NetworkType,
      isAdmin: boolean,
    ): TEControllerError<NetworkGraphOutput> => {
      switch (type) {
        case "events": {
          const ids = pipe(query.ids, fp.O.filter(fp.A.isNonEmpty));
          if (fp.O.isSome(ids)) {
            if (ids.value[0]) {
              return createEventNetworkGraph(ids.value[0], isAdmin)(ctx);
            }
          }
          break;
        }
      }

      const ids = pipe(
        query.ids,
        fp.O.getOrElse((): readonly UUID[] => []),
      );

      return createNetworkGraph(type, [...ids], query, isAdmin)(ctx);
    };

    return pipe(
      RequestDecoder.decodeNullableUser(req, [AdminRead.Type])(ctx),
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
