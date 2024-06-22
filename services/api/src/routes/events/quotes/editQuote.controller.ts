import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { toQuoteIO } from "./quote.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";

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
          }),
        ),
        TE.chainEitherK(toQuoteIO),
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
