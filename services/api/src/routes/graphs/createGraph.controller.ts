import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toGraphIO } from "./graph.io.js";
import { GraphEntity } from "#entities/Graph.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeCreateGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Create,
    ({ body: { type, options, ...body } }) => {
      ctx.logger.debug.log("Creating graph from data %O", body);
      return pipe(
        ctx.db.save(GraphEntity, [
          { ...body, graphType: type, options: options ?? {}, id: uuid() },
        ]),
        TE.chainEitherK(([data]) => toGraphIO(data)),
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
