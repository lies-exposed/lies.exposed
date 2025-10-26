import { GraphEntity } from "@liexp/backend/lib/entities/Graph.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { GraphIO } from "./graph.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateGraphRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Graph.Create,
    ({ body: { type, options, ...body } }) => {
      ctx.logger.debug.log("Creating graph from data %O", body);
      return pipe(
        ctx.db.save(GraphEntity, [
          { ...body, graphType: type, options: options ?? {}, id: uuid() },
        ]),
        TE.chainEitherK(([data]) => GraphIO.decodeSingle(data)),
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
