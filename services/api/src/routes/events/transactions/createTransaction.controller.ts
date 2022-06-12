import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { TRANSACTION } from "@liexp/shared/io/http/Events/Transaction";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { createEventQuery } from "../queries/createEvent.query";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";

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
          }
        ),
        to: ctx.db.findOneOrFail(
          payload.to.type === "Actor" ? ActorEntity : GroupEntity,
          {
            where: { id: Equal(payload.to.id) },
          }
        ),
      });

      return pipe(
        fetchOwnersTask,
        TE.chain(({ from, to }) =>
          createEventQuery(ctx)({
            type: TRANSACTION.value,
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
          })
        ),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
