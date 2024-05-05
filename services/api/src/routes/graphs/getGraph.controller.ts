import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toGraphIO } from "./graph.io.js";
import { GraphEntity } from "#entities/Graph.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGetGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Graph.Get, ({ params: { id } }) => {
    ctx.logger.debug.log("Fetching data from %s", id);
    return pipe(
      ctx.db.findOneOrFail(GraphEntity, { where: { id: Equal(id) } }),
      TE.chainEitherK(toGraphIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
