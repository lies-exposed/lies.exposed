import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetScientificStudyRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(EventV2IO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
