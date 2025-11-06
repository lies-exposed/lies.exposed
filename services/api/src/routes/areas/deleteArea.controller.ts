import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeDeleteAreaRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminDelete.literals[0]])({ jwt, logger }),
  )(Endpoints.Area.Delete, ({ params: { id } }) => {
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
      TE.chainEitherK((a) => AreaIO.decodeSingle(a)),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      })),
    );
  });
};
