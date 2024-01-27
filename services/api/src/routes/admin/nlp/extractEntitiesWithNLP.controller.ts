import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { extractEntitiesFromAnyCached } from "#flows/admin/nlp/extractEntitiesFromAny.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminExtractEntitiesWithNLPRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Admin.Custom.ExtractEntitiesWithNLP,
    ({ body }) => {
      return pipe(
        extractEntitiesFromAnyCached(ctx)(body),
        TE.map((data) => ({
          body: {
            data,
            total: 0,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
