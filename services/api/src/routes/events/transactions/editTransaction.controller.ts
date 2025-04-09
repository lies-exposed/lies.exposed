import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { TransactionIO } from "@liexp/backend/lib/io/event/transaction.io.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeEditTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.TransactionEvent.Edit,
    ({
      params: { id },
      body: { payload, media, keywords, links, ...body },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
        TE.chain((event) =>
          editEventQuery(event, {
            ...body,
            type: EVENT_TYPES.TRANSACTION,
            payload,
            media,
            keywords,
            links,
          })(ctx),
        ),
        TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(TransactionIO.decodeSingle),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
