import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getOrphanMediaFlow } from "#flows/media/getOrphanMedia.flow";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetOrphanMediaRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.Admin.Custom.GetOrphanMedia,
    () => {
      return pipe(
        getOrphanMediaFlow(ctx)(),
        TE.map((media) => ({
          body: { data: media, total: media.length },
          statusCode: 201,
        })),
      );
    },
  );
};
