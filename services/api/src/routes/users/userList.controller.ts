import * as endpoints from "@econnessione/shared/endpoints";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { UserEntity } from "./User.entity";
import { toUserIO } from "./user.io";

export const MakeUserListRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.User.UserList, ({ query }) => {
    const findOptions = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(UserEntity, { ...findOptions }),
          TE.chainEitherK(A.traverse(E.either)(toUserIO))
        ),
        total: ctx.db.count(UserEntity),
      }),
      TE.map(({ data, total }) => ({
        body: { data, total },
        statusCode: 200,
      }))
    );
  });
};
