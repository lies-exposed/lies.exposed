import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { editEventQuery } from "./queries/editEvent.query";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const EditEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.EditSuggestion,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Suggestion body %O", body);
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) =>
          pipe(
            editEventQuery(ctx)(suggestion.payload.event as any, body.event as any),
            TE.chain((event) =>
              ctx.db.save(EventSuggestionEntity, [
                {
                  ...suggestion,
                  payload: { ...body, event: event as any },
                  id,
                  status: "PENDING",
                },
              ])
            )
          )
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
