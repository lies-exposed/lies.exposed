import { endpoints } from "@econnessione/shared";
import * as passwordUtils from "@utils/password.utils";
import { uuid } from "@utils/uuid.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { UserEntity } from "./User.entity";
import {toUserIO } from './user.io'

export const MakeUserCreateRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    endpoints.User.UserCreate,
    ({ body: { password, ...userData } }) => {
      ctx.logger.debug.log("Login user with username or email %O", userData);
      return pipe(
        passwordUtils.hash(password),
        TE.chain((pw) =>
          ctx.db.save(UserEntity, [
            {
              id: uuid(),
              ...userData,
              passwordHash: pw,
            },
          ])
        ),
        TE.chainEitherK(([user]) => toUserIO(user)),
        TE.map((user) => ({
          body: user,
          statusCode: 200,
        }))
      );
    }
  );
};
