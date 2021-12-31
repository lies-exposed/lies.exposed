import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Router } from "express";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "routes/route.types";
import { toEventV2IO } from "./eventV2.io";

export const MakeGetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventV2Entity, "event")
        .loadAllRelationIds({
          relations: ["links", 'media', "keywords"],
        })
        .where("event.id = :eventId", { eventId: id }),
      (q) => {
        return ctx.db.execQuery(() => q.getOneOrFail());
      }
    );

    return pipe(
      selectEventTask,
      TE.chainEitherK(toEventV2IO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
