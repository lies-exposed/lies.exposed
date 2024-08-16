import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { mergeEventsFlow } from "#flows/events/mergeEvents.flow.js";
import { type Route } from "#routes/route.types.js";

export const MergeEventsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.EditManyEvents,
    ({ body: { params: { action, ids} } }) => {
      return pipe(
        mergeEventsFlow(ctx)(ids),
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
