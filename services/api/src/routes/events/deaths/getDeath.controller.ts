import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeGetDeathEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.DeathEvent.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: true,
      }),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: { data },
        statusCode: 201,
      })),
    );
  });
};
