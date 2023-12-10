import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { type Route } from "#routes/route.types.js";

export const CreateEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.CreateSuggestion, ({ body }) => {
    return pipe(
      ctx.db.save(EventSuggestionEntity, [
        { payload: body, status: "PENDING" },
      ]),
      TE.chain(([event]) =>
        ctx.db.findOneOrFail(EventSuggestionEntity, {
          where: { id: event.id },
        }),
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
