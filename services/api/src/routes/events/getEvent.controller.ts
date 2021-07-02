import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { EventEntity } from "@entities/Event.entity";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toEventIO } from "./event.io";

export const MakeGetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .leftJoinAndSelect("event.actors", "actors")
        .leftJoinAndSelect("event.groups", "groups")
        .leftJoinAndSelect("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.images", "images")
        .where("event.id = :eventId", { eventId: id }),
      (q) => {
        return ctx.db.execQuery(() => q.getOneOrFail());
      }
    );

    return pipe(
      selectEventTask,
      TE.chainEitherK((event) =>
        toEventIO({
          ...event,
          actors: event.actors.map((a) => a.id),
          groups: event.groups.map((g) => g.id),
          groupsMembers: event.groupsMembers.map((g) => g.id),
          links: [],
        } as any)
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
