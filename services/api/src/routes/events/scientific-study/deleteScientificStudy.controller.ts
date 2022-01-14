import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";

export const MakeDeleteScientificStudyRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Delete, ({ params: { id } }) => {
    return pipe(
      db.softDelete(EventV2Entity, id),
      TE.map(() => ({
        body: {
          data: true,
        },
        statusCode: 201,
      }))
    );
  });
};
