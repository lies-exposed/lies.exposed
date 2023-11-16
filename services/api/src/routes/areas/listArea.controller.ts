import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";
import { toAreaIO } from "./Area.io";
import { fetchAreas } from "@queries/areas/fetchAreas.query";
import { RequestDecoder } from "@utils/authenticationHandler";

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
