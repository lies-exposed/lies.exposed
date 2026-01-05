import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { mergeActor } from "#flows/actors/mergeActor.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeMergeActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.literals[0]])(ctx))(
    Endpoints.Actor.Custom.Merge,
    ({ body: { sourceId, targetId } }) => {
      ctx.logger.info.log("Merging actor %s into %s", sourceId, targetId);

      return pipe(
        mergeActor({
          sourceId,
          targetId,
        })(ctx),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
