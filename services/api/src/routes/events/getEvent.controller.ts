import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { DBService } from "@liexp/backend/lib/services/db.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const GetEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      DBService.execQuery((em) =>
        em
          .createQueryBuilder(EventV2Entity, "event")
          .loadAllRelationIds({
            relations: ["links", "media", "keywords"],
          })
          .where("event.id = :eventId", { eventId: id })
          .getOneOrFail(),
      ),
    );

    return pipe(
      selectEventTask,
      fp.RTE.chainEitherK(EventV2IO.decodeSingle),
      fp.RTE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    )(ctx);
  });
};
