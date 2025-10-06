import { ExtractEntitiesWithNLP } from "@liexp/backend/lib/pubsub/nlp/extractEntitiesWithNLP.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminExtractEntitiesWithNLPRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Admin.Custom.ExtractEntitiesWithNLP,
    ({ body }) => {
      return pipe(
        ExtractEntitiesWithNLP.publish(body)(ctx),
        TE.map((_data) => ({
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
          statusCode: 201,
        })),
      );
    },
  );
};
