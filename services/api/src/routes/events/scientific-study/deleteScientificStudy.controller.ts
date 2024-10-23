import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeDeleteScientificStudyRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Delete, ({ params: { id } }) => {
    return pipe(
      db.softDelete(EventV2Entity, id),
      TE.map(() => ({
        body: {
          data: true,
        },
        statusCode: 201,
      })),
    );
  });
};
