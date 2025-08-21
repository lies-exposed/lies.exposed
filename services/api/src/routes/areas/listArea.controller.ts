import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListAreaRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Area.List, ({ query }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(req, [])(ctx),
      fp.TE.fromIO,
      fp.TE.chain((user) =>
        fetchAreas(query, user ? checkIsAdmin(user.permissions) : false)(ctx),
      ),
      TE.chain(([areas, total]) => {
        return pipe(
          areas,
          (aa) => AreaIO.decodeMany(aa),
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
