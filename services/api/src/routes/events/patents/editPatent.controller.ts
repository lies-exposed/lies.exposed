import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Patent } from "@econnessione/shared/io/http/Events";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { editEventQuery } from "../queries/editEvent.query";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeEditPatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.PatentEvent.Edit,
    ({
      params: { id },
      body: { payload, media, keywords, links, ...body },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id } }),
        TE.chain((event) =>
          editEventQuery(ctx)(event, {
            ...body,
            type: Patent.PATENT.value,
            payload,
            media: media,
            keywords: keywords,
            links: links,
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
