import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Route } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export const MakeGetEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetSuggestion, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
