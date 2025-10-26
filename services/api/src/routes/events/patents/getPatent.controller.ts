import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { PatentIO } from "@liexp/backend/lib/io/event/patent.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetPatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.PatentEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: Equal(EVENT_TYPES.PATENT), id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(PatentIO.decodeSingle),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
