import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const MakeGetEventSuggestionListRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetSuggestions, ({ }) => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
        data: ctx.db.find(EventSuggestionEntity),
        total: ctx.db.count(EventSuggestionEntity),
      }),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 201,
      }))
    );
  });
};
