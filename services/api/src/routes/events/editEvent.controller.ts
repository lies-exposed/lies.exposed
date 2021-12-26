import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Router } from "express";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "routes/route.types";
import { toEventV2IO } from "./eventV2.io";
import { editEventQuery } from "./queries/editEvent.query";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Edit, ({ params: { id }, body }) => {
    ctx.logger.debug.log("Incoming body %O", body);

    return pipe(
      editEventQuery(ctx)(body),
      TE.chain((updateData) =>
        ctx.db.save(EventV2Entity, [{ id, ...updateData }])
      ),
      TE.chain(() =>
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id },
          relations: ["media"],
          loadRelationIds: {
            relations: ["links", "keywords"],
          },
        })
      ),
      TE.chainEitherK((event) => toEventV2IO(event)),
      TE.map((event) => ({
        body: {
          data: event,
        },
        statusCode: 200,
      }))
    );
  });
};
