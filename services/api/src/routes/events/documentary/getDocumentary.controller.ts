import { EventV2Entity } from "@entities/Event.v2.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { DOCUMENTARY } from '@liexp/shared/io/http/Events/Documentary';
import { Route } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { toEventV2IO } from "../eventV2.io";

export const MakeGetDocumentaryEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.DocumentaryEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: DOCUMENTARY.value, id },
        loadRelationIds: {
          relations: ["media", "keywords", "links"],
        },
      }),
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
