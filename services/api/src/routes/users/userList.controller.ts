import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { getORMOptions } from "@utils/orm.utils";

export const MakeUserListRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.User.List,
    ({ query: { ids: id, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query, id },
        ctx.env.DEFAULT_PAGE_SIZE
      );
      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            ctx.db.find(UserEntity, { ...findOptions }),
            TE.chainEitherK(A.traverse(E.Applicative)(toUserIO))
          ),
          total: ctx.db.count(UserEntity),
        }),
        TE.map(({ data, total }) => ({
          body: { data, total },
          statusCode: 200,
        }))
      );
    }
  );
};
