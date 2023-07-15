import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/Transaction";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toEventV2IO } from "../eventV2.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

export const MakeGetTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.TransactionEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: Equal(TRANSACTION.value), id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
