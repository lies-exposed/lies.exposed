import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const DeleteEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.DeleteSuggestion,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.delete(EventSuggestionEntity, [id]),
        TE.map((data) => ({
          body: {
            data: data.affected ? data.affected > 0 : false,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
