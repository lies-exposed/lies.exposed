import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { QuoteIO } from "@liexp/backend/lib/io/event/quote.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateQuoteRoute: Route = (r, { db }) => {
  AddEndpoint(r)(
    Endpoints.QuoteEvent.Create,
    ({ body: { payload, ...body } }) => {
      const documentaryData = {
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
        media: [],
        keywords: body.keywords.map((l) => ({
          id: l,
        })),
      };

      return pipe(
        db.save(EventV2Entity, [
          {
            type: QUOTE.literals[0],
            ...documentaryData,
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
