import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const EditEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.EditSuggestion,
    ({ params: { id }, body }) => {
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) =>
          ctx.db.save(EventSuggestionEntity, [
            {
              ...suggestion,
              ...body,
              id,
              status: "PENDING",
            },
          ])
        ),
        TE.map(([data]) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
