import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { DeathIO } from "@liexp/backend/lib/io/event/death.io.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeEditDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.Edit,
    ({
      params: { id },
      body: { payload, media, keywords, links, ...body },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
        TE.chain((event) =>
          editEventQuery(event, {
            ...body,
            type: "Death",
            payload,
            date: O.some(body.date),
            draft: O.some(body.draft),
            body: O.fromNullable(body.body),
            excerpt: O.fromNullable(body.excerpt),
            media: O.some(media),
            keywords: O.some(keywords),
            links: O.some(links),
          })(ctx),
        ),
        TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(DeathIO.decodeSingle),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
