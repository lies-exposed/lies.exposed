import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getLinkAdminStatsFlow } from "#flows/admin/links/getLinkAdminStats.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetLinkStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.Admin.Custom.GetLinkStats,
    () => {
      return pipe(
        getLinkAdminStatsFlow(ctx)(),
        TE.map(({ total, noPublishDate, noThumbnails }) => ({
          body: {
            data: {},
            total,
            noThumbnails,
            totals: {
              noPublishDate,
              noThumbnails,
            },
          },
          statusCode: 201,
        })),
      );
    },
  );
};
