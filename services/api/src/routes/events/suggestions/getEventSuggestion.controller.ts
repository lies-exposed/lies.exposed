import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const GetEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetSuggestion, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
      TE.chainEitherK(toEventSuggestion),
      TE.map((data) => ({
        body: {
          data: [data],
          total: 1,
        },
        statusCode: 201,
      })),
    );
  });
};
