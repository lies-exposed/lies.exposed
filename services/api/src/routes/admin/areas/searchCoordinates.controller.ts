import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchCoordinates } from "#flows/areas/fetchCoordinates.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminSearchAreaCoordinatesRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Admin.Custom.SearchAreaCoordinates,
    ({ body: { label } }) => {
      return pipe(
        fetchCoordinates(ctx)(label),
        TE.map((coords) => ({
          body: { data: { id: uuid(), ...coords } },
          statusCode: 201,
        })),
      );
    },
  );
};
