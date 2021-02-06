import { endpoints } from "@econnessione/shared";
import { BadRequestError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import * as passwordUtils from "@utils/password.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { AddEndpoint } from "ts-endpoint-express";
import { UserEntity } from "./User.entity";

export const MakeUserLoginRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    endpoints.User.UserLogin,
    ({ body: { username, password } }) => {
      ctx.logger.debug.log("Login user with username or email %s", username);
      return pipe(
        ctx.db.findOneOrFail(UserEntity, {
          where: [{ username }, { email: username }],
        }),
        ctx.logger.debug.logInTaskEither("User %O"),
        TE.chainFirst((user) =>
          pipe(
            passwordUtils.verify(password, user.passwordHash),
            TE.chain((isEqual) => {
              if (!isEqual) {
                return TE.left(BadRequestError("Password is wrong"));
              }
              return TE.right(isEqual);
            })
          )
        ),
        TE.chain(({ passwordHash, ...user }) =>
          TE.fromIO(
            ctx.jwt.signUser({
              ...user,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            })
          )
        ),
        TE.map((token) => ({
          body: { data: { token } },
          statusCode: 201,
        }))
      );
    }
  );
};
