import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";

export const MakeDeleteEventRoute: Route = (r, { db, logger, urlMetadata }) => {
  AddEndpoint(r)(Endpoints.Event.Delete, ({ params: { id } }) => {
    return pipe(
      db.softDelete(EventV2Entity, id),
      TE.map((data) => ({
        body: {
          data: true,
        },
        statusCode: 200,
      }))
    );
  });
};
