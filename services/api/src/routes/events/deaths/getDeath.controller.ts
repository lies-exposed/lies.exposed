import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { EventV2IO } from "../eventV2.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";

export const MakeGetDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: true,
      }),
      TE.chainEitherK(EventV2IO.decodeSingle),
      TE.map((data) => ({
        body: { data },
        statusCode: 201,
      })),
    );
  });
};
