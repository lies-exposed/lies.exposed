import { GraphEntity } from "@liexp/backend/lib/entities/Graph.entity.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Like } from "typeorm";
import { GraphIO } from "./graph.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListGraphsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Graph.List, ({ query: { q } }) => {
    const query = foldOptionals({ q });
    const where = query.q ? { label: Like(`%${query.q.toString()}%`) } : {};
    return pipe(
      ctx.db.findAndCount(GraphEntity, { where }),
      TE.chainEitherK(([data, total]) =>
        pipe(
          data,
          GraphIO.decodeMany,
          fp.E.map((data) => ({ data, total })),
        ),
      ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total: total,
        },
        statusCode: 200,
      })),
    );
  });
};
