import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { editEventQuery } from "../queries/editEvent.query";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeEditDeathEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.Edit,
    ({
      params: { id },
      body: { payload, media, keywords, links, ...body },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id } }),
        TE.chain((event) =>
          editEventQuery(ctx)(event, {
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
          })
        ),
        TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: event.id },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
