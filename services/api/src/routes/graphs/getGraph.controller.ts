import { GraphEntity } from "@liexp/backend/lib/entities/Graph.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GraphIO } from "./graph.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetGraphRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Graph.Get, ({ params: { id } }) => {
    ctx.logger.debug.log("Fetching data from %s", id);
    return pipe(
      ctx.db.findOneOrFail(GraphEntity, { where: { id: Equal(id) } }),
      TE.chainEitherK(GraphIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
