import * as endpoints from "@econnessione/shared/endpoints";
import { EventEntity } from "@entities/Event.entity";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toEventIO } from "./event.io";

export const MakeGetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .addSelect("actors.id", "actors")
        .addSelect("groups.id", "groups")
        .addSelect("groupsMembers.id", "groupsMembers")
        .leftJoin("event.actors", "actors")
        .leftJoin("event.groups", "groups")
        .leftJoin("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.images", "images")
        .where("event.id = :eventId", { eventId: id }),
      (q) => {
        return ctx.db.execQuery(() => q.getOneOrFail());
      }
    );

    return pipe(
      selectEventTask,
      TE.map((event) => ({ ...event, links: [] })),
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
