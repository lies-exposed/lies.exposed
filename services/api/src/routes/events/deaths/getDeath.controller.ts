import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { DeathIO } from "@liexp/backend/lib/io/event/death.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetDeathEventRoute: Route = (
  r,
  { s3: _s3, db, env: _env },
) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: true,
      }),
      TE.chainEitherK(DeathIO.decodeSingle),
      TE.map((data) => ({
        body: { data },
        statusCode: 201,
      })),
    );
  });
};
