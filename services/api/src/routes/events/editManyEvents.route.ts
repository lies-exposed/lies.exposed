import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminCreate } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { mergeEventsFlow } from "#flows/events/mergeEvents.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MergeEventsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.literals[0]])(ctx))(
    Endpoints.Event.Custom.EditManyEvents,
    ({
      body: {
        params: { action: _action, ids },
      },
    }) => {
      ctx.logger.info.log("Merging %d events: %O", ids.length, ids);

      return pipe(
        mergeEventsFlow(ids)(ctx),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
