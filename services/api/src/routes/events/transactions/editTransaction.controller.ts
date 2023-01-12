import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Transaction } from "@liexp/shared/io/http/Events";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { Route } from "../../route.types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { toEventV2IO } from "../eventV2.io";
import { editEventQuery } from "../queries/editEvent.query";

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
          editEventQuery(ctx)(event, {
            ...body,
            type: Transaction.TRANSACTION.value,
            payload,
            media,
            keywords,
            links,
          })
        ),
        TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal( event.id) },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
