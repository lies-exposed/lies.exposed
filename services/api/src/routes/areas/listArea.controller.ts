import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { Route } from "../route.types.js";
import { toAreaIO } from "./Area.io.js";
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
          A.traverse(E.Applicative)((a) => toAreaIO(a, ctx.env.SPACE_ENDPOINT)),
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
