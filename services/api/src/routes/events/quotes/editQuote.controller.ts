import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/Quote";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { type Route } from "@routes/route.types";

export const MakeEditQuoteRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(
    Endpoints.QuoteEvent.Edit,
    ({ params: { id }, body: { payload, ...body } }) => {
      const quoteData = {
        ...body,
        links: body.links.map((l) => {
          if (UUID.is(l)) {
            return {
              id: l,
            };
          }
          return {
            ...l,
          };
        }),
        keywords: body.keywords.map((l) => ({
          id: l,
        })),
        media: [],
      };

      return pipe(
        db.save(EventV2Entity, [
          {
            id,
            type: QUOTE.value,
            ...quoteData,
            payload,
          },
        ]),
        TE.chain(([result]) =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(result.id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
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
