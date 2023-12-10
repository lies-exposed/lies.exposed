import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../../route.types.js";
import { toDeathIO } from "./death.io.js";
import { DeathEventViewEntity } from "#entities/events/DeathEvent.entity.js";

export const MakeDeleteDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(DeathEventViewEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst((event) => db.softDelete(DeathEventViewEntity, [event.id])),
      TE.chainEitherK(toDeathIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
