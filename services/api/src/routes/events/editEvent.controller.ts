import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toEventV2IO } from "./eventV2.io.js";
import { editEventQuery } from "./queries/editEvent.query.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const EditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, [AdminEdit.value]))(
    Endpoints.Event.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Incoming body %O", body);

      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(id) },
          relations: ["links", "media", "keywords"],
        }),
        TE.chain((event) => editEventQuery(ctx)(event, body)),
        ctx.logger.debug.logInTaskEither(`Update data %O`),
        TE.chain((updateData) =>
          ctx.db.save(EventV2Entity, [{ id, ...updateData }]),
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          }),
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((event) => ({
          body: { data: event },
          statusCode: 200,
        })),
      );
    },
  );
};
