import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { ScientificStudyIO } from "@liexp/backend/lib/io/event/scientific-study.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
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
      TE.chainEitherK(ScientificStudyIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
