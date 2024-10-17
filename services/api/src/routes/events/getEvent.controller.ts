import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { type RouteContext } from "../route.types.js";
import { EventV2IO } from "./eventV2.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { DBService } from "#services/db.service.js";

export const GetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }) => {
    const selectEventTask = pipe(
      DBService.execQuery((em) =>
        em
          .createQueryBuilder(EventV2Entity, "event")
          .loadAllRelationIds({
            relations: ["links", "media", "keywords"],
          })
          .where("event.id = :eventId", { eventId: id })
          .getOneOrFail(),
      ),
    );

    return pipe(
      selectEventTask,
      fp.RTE.chainEitherK(EventV2IO.decodeSingle),
      fp.RTE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    )(ctx);
  });
};
