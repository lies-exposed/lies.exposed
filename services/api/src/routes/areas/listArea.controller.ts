import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AreaIO } from "./Area.io.js";
import { fetchAreas } from "#queries/areas/fetchAreas.query.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListAreaRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Area.List, ({ query }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(ctx)(req, []),
      fp.TE.fromIO,
      fp.TE.chain((user) =>
        fetchAreas(ctx)(query, user ? checkIsAdmin(user.permissions) : false),
      ),
      TE.chain(([areas, total]) => {
        return pipe(
          areas,
          (aa) => AreaIO.decodeMany(aa, ctx.env.SPACE_ENDPOINT),
          TE.fromEither,
          TE.map((data) => ({ total, data })),
        );
      }),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};
