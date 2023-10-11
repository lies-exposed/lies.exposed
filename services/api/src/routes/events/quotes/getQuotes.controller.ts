import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toQuoteIO } from "./quote.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

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
