import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { NationIO } from "@liexp/backend/lib/io/Nation.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type Nation } from "@liexp/shared/lib/io/http/Nation.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type FindOptionsWhere, ILike, In } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListNationRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Nation.List, ({ query: { q, ids } }) => {
    const filters = foldOptionals({ q, ids });

    const where: FindOptionsWhere<NationEntity> = {};

    if (filters.q) {
      where.name = ILike(`%${filters.q.toLowerCase()}%`);
    }

    if (filters.ids) {
      where.id = In(filters.ids);
    }

    return pipe(
      ctx.db.findAndCount(NationEntity, {
        where,
        loadRelationIds: true,
      }),
      TE.chainEitherK(([nations, total]) =>
        pipe(
          NationIO.decodeMany(nations),
          fp.E.map((nations): [readonly Nation[], number] => [nations, total]),
        ),
      ),
      TE.map(([data, total]) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};
