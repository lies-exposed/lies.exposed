import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toQuoteIO } from "./quote.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

export const MakeDeleteQuoteRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(Endpoints.QuoteEvent.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "links", "keywords"],
        },
      }),
      TE.chainFirst(() => db.delete(EventV2Entity, [id])),
      TE.chainEitherK(toQuoteIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
