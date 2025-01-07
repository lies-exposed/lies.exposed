import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeDeleteAreaRoute: Route = (r, { db, env }) => {
  AddEndpoint(r)(Endpoints.Area.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
        where: { id: Equal(id) },
        withDeleted: true,
      }),
      TE.chainFirst((area) =>
        area.deletedAt
          ? db.delete(AreaEntity, id)
          : db.softDelete(AreaEntity, id),
      ),
      TE.chainEitherK((a) => AreaIO.decodeSingle(a, env.SPACE_ENDPOINT)),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      })),
    );
  });
};
