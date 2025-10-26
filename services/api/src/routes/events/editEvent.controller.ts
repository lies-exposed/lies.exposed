import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const EditEventRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminEdit.literals[0]])(ctx))(
    Endpoints.Event.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Incoming body %O", body);

      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(id) },
          relations: ["links", "media", "keywords"],
        }),
        TE.chain((event) => editEventQuery(event, body)(ctx)),
        LoggerService.TE.debug(ctx, `Update data %O`),
        TE.chain((updateData) =>
          ctx.db.save(EventV2Entity, [{ id, ...updateData }]),
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          }),
        ),
        TE.chainEitherK(EventV2IO.decodeSingle),
        TE.map((event) => ({
          body: { data: event },
          statusCode: 200,
        })),
      );
    },
  );
};
