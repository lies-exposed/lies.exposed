import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toQuoteIO } from "./quote.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetQuoteRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.QuoteEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["keywords", "media", "links"],
        },
      }),
      TE.chainEitherK(toQuoteIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
