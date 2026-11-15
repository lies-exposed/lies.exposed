import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { QuoteIO } from "@liexp/backend/lib/io/event/quote.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminDelete } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeDeleteQuoteRoute: Route = (r, ctx) => {
  const { db, logger: _logger } = ctx;
  AddEndpoint(r, authenticationHandler([AdminDelete.literals[0]])(ctx))(
    Endpoints.QuoteEvent.Delete,
    ({ params: { id } }) => {
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
    },
  );
};
