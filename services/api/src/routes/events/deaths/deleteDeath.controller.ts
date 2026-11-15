import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { DeathIO } from "@liexp/backend/lib/io/event/death.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeDeleteDeathEventRoute: Route = (r, ctx) => {
  const { db } = ctx;
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.DeathEvent.Delete,
    ({ params: { id } }) => {
      return pipe(
        db.findOneOrFail(EventV2Entity, {
          where: { id },
          loadRelationIds: true,
        }),
        TE.chainFirst((event) => db.softDelete(EventV2Entity, [event.id])),
        TE.chainEitherK(DeathIO.decodeSingle),
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
