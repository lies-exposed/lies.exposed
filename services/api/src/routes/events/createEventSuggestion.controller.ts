
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const CreateEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.CreateSuggestion, ({ body }) => {
    return pipe(
      ctx.db.save(EventSuggestionEntity, [{ payload: body, status: 'PENDING' }]),
      TE.chain(([event]) =>
        ctx.db.findOneOrFail(EventSuggestionEntity, {
          where: { id: event.id },
        })
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
