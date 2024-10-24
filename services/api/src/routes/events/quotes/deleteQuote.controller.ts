import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { QuoteIO } from "./quote.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";

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
      TE.chainEitherK(QuoteIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
