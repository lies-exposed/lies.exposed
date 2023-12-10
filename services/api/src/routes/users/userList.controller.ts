import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toUserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeUserListRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.User.List,
    ({ query: { ids: id, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query, id },
        ctx.env.DEFAULT_PAGE_SIZE,
      );
      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            ctx.db.find(UserEntity, { ...findOptions }),
            TE.chainEitherK(A.traverse(E.Applicative)(toUserIO)),
          ),
          total: ctx.db.count(UserEntity),
        }),
        TE.map(({ data, total }) => ({
          body: { data, total },
          statusCode: 200,
        })),
      );
    },
  );
};
