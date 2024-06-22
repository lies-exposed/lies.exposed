import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { toGraphIO } from "./graph.io.js";
import { GraphEntity } from "#entities/Graph.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeEditGraphRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Graph.Edit,
    ({ params: { id }, body: { type, ...body } }) => {
      ctx.logger.debug.log("Editing graph (%s): %O", id, body);
      return pipe(
        ctx.db.save(GraphEntity, [
          { ...body, options: body.options ?? {}, graphType: type, id },
        ]),
        TE.chain(() =>
          ctx.db.findOneOrFail(GraphEntity, { where: { id: Equal(id) } }),
        ),
        TE.chainEitherK((data) => toGraphIO(data)),
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
