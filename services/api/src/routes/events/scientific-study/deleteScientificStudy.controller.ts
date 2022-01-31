import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";

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
