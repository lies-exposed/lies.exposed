import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { BookIO } from "@liexp/backend/lib/io/event/book.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetBookEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.BookEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["keywords", "media", "links"],
        },
      }),
      TE.chainEitherK(BookIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
