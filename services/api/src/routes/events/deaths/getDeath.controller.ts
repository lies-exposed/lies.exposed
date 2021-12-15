import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Route } from "routes/route.types";
import { toEventV2IO } from "../eventV2.io";

export const MakeGetDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: { data },
        statusCode: 201,
      }))
    );
  });
};
