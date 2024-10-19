import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GraphIO } from "./graph.io.js";
import { GraphEntity } from "#entities/Graph.entity.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditGraphRoute: Route = (r, ctx) => {
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
        TE.chainEitherK((data) => GraphIO.decodeSingle(data)),
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
