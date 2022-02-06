import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { PATENT } from "@econnessione/shared/io/http/Events/Patent";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toEventV2IO } from "../eventV2.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";

export const MakeGetPatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.PatentEvent.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, {
        where: { type: PATENT.value, id },
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
