import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toEventV2IO } from "./eventV2.io.js";
import { createEventQuery } from "./queries/createEvent.query.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const CreateEventRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Event.Create,
    ({ body }) => {
      return pipe(
        createEventQuery(ctx)(body),
        ctx.logger.debug.logInTaskEither("Create data %O"),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          }),
        ),
        TE.chain((event) => TE.fromEither(toEventV2IO(event))),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
