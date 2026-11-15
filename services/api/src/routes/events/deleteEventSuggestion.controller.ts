import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminDelete } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const DeleteEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminDelete.literals[0]])(ctx))(
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
