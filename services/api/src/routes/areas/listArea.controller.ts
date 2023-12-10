import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type Router } from "express";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type RouteContext } from "../route.types.js";
import { toAreaIO } from "./Area.io.js";
import { fetchAreas } from "#queries/areas/fetchAreas.query.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListAreaRoute = (r: Router, ctx: RouteContext): void => {
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
          A.traverse(E.Applicative)((a) =>
            toAreaIO({ ...a, media: a.media.map((m) => m.id) as any[] }),
          ),
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
