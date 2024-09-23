import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getMediaAdminStatsFlow } from "#flows/admin/media/getMediaAdminStats.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetMediaStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.Admin.Custom.GetMediaStats,
    () => {
      return pipe(
        getMediaAdminStatsFlow(ctx)(),
        TE.map(
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
      );
    },
  );
};
