import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { RouteContext } from "routes/route.types";

export const MakeGetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .leftJoinAndSelect("event.actors", "actors")
        .leftJoinAndSelect("event.groups", "groups")
        .leftJoinAndSelect("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.images", "images")
        .loadAllRelationIds({
          relations: ["actors", "groups", "groupsMembers", "links", "keywords"],
        })
        .where("event.id = :eventId", { eventId: id }),
      (q) => {
        return ctx.db.execQuery(() => q.getOneOrFail());
      }
    );

    return pipe(
      selectEventTask,
      TE.chainEitherK(toEventIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
