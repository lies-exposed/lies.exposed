import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { TRANSACTION } from '@liexp/shared/io/http/Events/Transaction';
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toEventV2IO } from "../eventV2.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";

export const MakeGetTransactionEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.TransactionEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: TRANSACTION.value, id },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
