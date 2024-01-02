import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getOrphanMediaFlow } from "#flows/media/getOrphanMedia.flow.js";
import { getTempMediaCountFlow } from "#flows/media/getTempMediaCount.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminGetMediaStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.Admin.Custom.GetMediaStats,
    () => {
      return pipe(
        sequenceS(TE.ApplicativePar)({
          orphans: getOrphanMediaFlow(ctx)(),
          temp: getTempMediaCountFlow(ctx)(),
        }),
        TE.map(({ orphans: data, temp }) => ({
          body: {
            data: { ...data, temp },
            total: data.orphans.length + data.match.length,
            totals: {
              orphans: data.orphans.length,
              match: data.match.length,
              temp: temp.length,
            },
          },
          statusCode: 201,
        })),
      );
    },
  );
};
