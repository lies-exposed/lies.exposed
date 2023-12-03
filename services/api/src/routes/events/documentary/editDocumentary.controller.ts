import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type Route } from "../../route.types";
import { editEventQuery } from "../queries/editEvent.query";
import { toDocumentaryIO } from "./documentary.io";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeEditDocumentaryEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.DocumentaryEvent.Edit,
    ({
      params: { id },
      body: { payload, media, keywords, links, ...body },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
        TE.chain((event) =>
          editEventQuery(ctx)(event, {
            ...body,
            type: EventTypes.DOCUMENTARY.value,
            payload,
            media: O.some([payload.media]),
            keywords,
            links,
          }),
        ),
        TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(toDocumentaryIO),
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
