import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "../route.types";
import { toEventV2IO } from "./eventV2.io";
import { editEventQuery } from "./queries/editEvent.query";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Edit, ({ params: { id }, body }) => {
    ctx.logger.debug.log("Incoming body %O", body);

    return pipe(
      ctx.db.findOneOrFail(EventV2Entity, { where: { id } }),
      TE.chain((event) => editEventQuery(ctx)(event, body)),
      ctx.logger.debug.logInTaskEither(`Update data %O`),
      TE.chain((updateData) =>
        ctx.db.save(EventV2Entity, [{ id, ...updateData }])
      ),
      TE.chain(() =>
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        })
      ),
      TE.chainEitherK(toEventV2IO),
      TE.map((event) => ({
        body: { data: event },
        statusCode: 200,
      }))
    );
  });
};
