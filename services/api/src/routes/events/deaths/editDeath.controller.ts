import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../../route.types.js";
import { EventV2IO } from "../eventV2.io.js";
import { editEventQuery } from "../queries/editEvent.query.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";

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
        TE.chainEitherK(EventV2IO.decodeSingle),
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
