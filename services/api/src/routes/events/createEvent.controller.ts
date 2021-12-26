import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventV2IO } from "./eventV2.io";
import { createEventQuery } from "./queries/createEvent.query";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";

export const MakeCreateEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Create, ({ body }) => {
    return pipe(
      createEventQuery(ctx)(body),
      ctx.logger.info.logInTaskEither("Create data %O"),
      TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
      TE.chain(([event]) =>
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: event.id },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        })
      ),
      TE.chain((event) => TE.fromEither(toEventV2IO(event))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
