import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type ServerContext } from "#context/context.type.js";
import { getLinkAdminStatsFlow } from "#flows/admin/links/getLinkAdminStats.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetLinkStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Admin.Custom.GetLinkStats,
    () => {
      return pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK(getLinkAdminStatsFlow()),
        fp.RTE.map(({ total, noPublishDate, noThumbnails }) => ({
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
      )(ctx);
    },
  );
};
