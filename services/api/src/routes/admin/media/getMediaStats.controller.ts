import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { getMediaAdminStatsFlow } from "#flows/admin/media/getMediaAdminStats.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route, type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetMediaStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Admin.Custom.GetMediaStats,
    () => {
      return pipe(
        fp.RTE.ask<RouteContext>(),
        fp.RTE.chainTaskEitherK(getMediaAdminStatsFlow()),
        fp.RTE.map(
          ({
            orphans: data,
            temp,
            noThumbnails,
            needRegenerateThumbnail,
            total,
          }) => ({
            body: {
              data: {
                ...data,
                temp,
                noThumbnails: noThumbnails.map(({ label, id }) => ({
                  label,
                  id,
                })),
                needRegenerateThumbnail: [],
              },
              total,
              totals: {
                orphans: data.orphans.length,
                match: data.match.length,
                temp: temp.length,
                noThumbnails: noThumbnails.length,
                needRegenerateThumbnail,
              },
            },
            statusCode: 201,
          }),
        ),
      )(ctx);
    },
  );
};
