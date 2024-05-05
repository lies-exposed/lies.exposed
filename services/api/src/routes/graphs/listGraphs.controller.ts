import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Like } from "typeorm";
import { toGraphIO } from "./graph.io.js";
import { GraphEntity } from "#entities/Graph.entity.js";
import { type RouteContext } from "#routes/route.types.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeListGraphsRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Graph.List, ({ query: { q } }) => {
    const query = foldOptionals({ q });
    const where = query.q ? { label: Like(`%${query.q}%`) } : {};
    return pipe(
      ctx.db.findAndCount(GraphEntity, { where }),
      TE.chainEitherK(([data, total]) =>
        pipe(
          data,
          fp.A.traverse(fp.E.Applicative)(toGraphIO),
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
