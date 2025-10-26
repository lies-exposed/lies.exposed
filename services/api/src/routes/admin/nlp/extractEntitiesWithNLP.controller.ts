import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { readExtractedEntities } from "@liexp/backend/lib/flows/admin/nlp/extractEntitiesFromAny.flow.js";
import { ExtractEntitiesWithNLP } from "@liexp/backend/lib/pubsub/nlp/extractEntitiesWithNLP.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeAdminTriggerExtractEntitiesWithNLPRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Admin.Custom.TriggerExtractEntitiesWithNLP,
    ({ body }) => {
      return pipe(
        ExtractEntitiesWithNLP.publish(body)(ctx),
        TE.map((_data) => ({
          body: {
            data: { success: true },
            total: 1,
          },
          statusCode: 202, // Accepted - processing started
        })),
      );
    },
  );
};

export const MakeAdminGetExtractEntitiesWithNLPRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Admin.Custom.GetExtractEntitiesWithNLP,
    ({ body }) => {
      return pipe(
        readExtractedEntities(body)(ctx),
        TE.fold(
          (_error) =>
            TE.right({
              body: {
                data: {
                  entities: {
                    actors: [],
                    groups: [],
                    keywords: [],
                  },
                  sentences: [],
                },
                total: 0,
              },
              statusCode: 404, // Not found - extraction not completed or not started
            }),
          (data) =>
            TE.right({
              body: {
                data,
                total: 1,
              },
              statusCode: 200,
            }),
        ),
      );
    },
  );
};
