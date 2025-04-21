import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { TransactionIO } from "@liexp/backend/lib/io/event/transaction.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.TransactionEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: Equal(TRANSACTION.Type), id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(TransactionIO.decodeSingle),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
