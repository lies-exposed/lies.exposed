import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const DeleteEventRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminDelete.literals[0]])({ jwt, logger }),
  )(Endpoints.Event.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, { where: { id } }),
      TE.tap(() => db.softDelete(EventV2Entity, id)),
      TE.chainEitherK(EventV2IO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
