import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { QuoteIO } from "@liexp/backend/lib/io/event/quote.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditQuoteRoute: Route = (r, { db, logger: _logger }) => {
  AddEndpoint(r)(
    Endpoints.QuoteEvent.Edit,
    ({ params: { id }, body: { payload, ...body } }) => {
      const quoteData = {
        ...body,
        links: body.links.map((l) => {
          if (Schema.is(UUID)(l)) {
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
            type: QUOTE.literals[0],
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
          }),
        ),
        TE.chainEitherK(QuoteIO.decodeSingle),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
