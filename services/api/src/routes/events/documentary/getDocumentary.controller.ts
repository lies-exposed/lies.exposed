import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toDocumentaryIO } from "./documentary.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

export const MakeGetDocumentaryEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.DocumentaryEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: Equal(EventTypes.DOCUMENTARY.value), id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(toDocumentaryIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
