import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { EventV2Entity } from "@entities/Event.v2.entity";
import { toEventV2IO } from "../eventV2.io";
import { Route } from "@routes/route.types";

export const MakeGetPatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.PatentEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: Equal( PATENT.value), id: Equal(id) },
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
