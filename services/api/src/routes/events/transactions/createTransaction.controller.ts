import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { TransactionIO } from "@liexp/backend/lib/io/event/transaction.io.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreateTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.TransactionEvent.Create,
    ({ body: { links, keywords, media, payload, ...body } }) => {
      ctx.logger.debug.log("Create transaction with payload %O", payload);

      const fetchOwnersTask = sequenceS(TE.ApplicativePar)({
        from: ctx.db.findOneOrFail(
          payload.from.type === "Actor" ? ActorEntity : GroupEntity,
          {
            where: { id: Equal(payload.from.id) },
          },
        ),
        to: ctx.db.findOneOrFail(
          payload.to.type === "Actor" ? ActorEntity : GroupEntity,
          {
            where: { id: Equal(payload.to.id) },
          },
        ),
      });

      return pipe(
        fetchOwnersTask,
        TE.chain(({ from, to }) =>
          createEventQuery({
            type: TRANSACTION.literals[0],
            ...body,
            payload: {
              ...payload,
              from: {
                ...payload.from,
                id: from.id,
              },
              to: {
                ...payload.to,
                id: to.id,
              },
            },
            media,
            links,
            keywords,
          })(ctx),
        ),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
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
          statusCode: 201,
        })),
      );
    },
  );
};
