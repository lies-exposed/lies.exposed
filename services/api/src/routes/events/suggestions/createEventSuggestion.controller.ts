import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { EventSuggestionCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const CreateEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(
    r,
    authenticationHandler([EventSuggestionCreate.literals[0]])(ctx),
  )(Endpoints.Event.Custom.CreateSuggestion, ({ body }) => {
    return pipe(
      ctx.db.save(EventSuggestionEntity, [
        { payload: { ...body, type: "Update" }, status: "PENDING" },
      ]),
      TE.chain(([event]) =>
        ctx.db.findOneOrFail(EventSuggestionEntity, {
          where: { id: event.id },
        }),
      ),
      TE.chainEitherK(toEventSuggestion),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
