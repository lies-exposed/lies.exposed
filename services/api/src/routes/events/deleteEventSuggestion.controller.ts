import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { type Route } from "@routes/route.types";

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
        }))
      );
    }
  );
};
