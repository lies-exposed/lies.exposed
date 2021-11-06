import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { EventEntity } from "@entities/Event.entity";
import { Route } from "@routes/route.types";

export const MakeDeleteEventRoute: Route = (r, { db, logger, urlMetadata }) => {
  AddEndpoint(r)(Endpoints.Event.Delete, ({ params: { id } }) => {
    return pipe(
      db.softDelete(EventEntity, id),
      TE.map((data) => ({
        body: {
          data: true,
        },
        statusCode: 201,
      }))
    );
  });
};
