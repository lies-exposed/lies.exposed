import { AddEndpoint, UserLogin } from "@liexp/shared/lib/endpoints";
import { UserStatusApproved } from "@liexp/shared/lib/io/http/User";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UserEntity } from "@entities/User.entity";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";
import * as passwordUtils from "@utils/password.utils";

export const MakeUserLoginRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(UserLogin, ({ body: { username, password } }) => {
    ctx.logger.debug.log("Login user with username or email %s", username);
    return pipe(
      ctx.db.findOneOrFail(UserEntity, {
        where: [{ username }, { email: username }],
      }),
      TE.mapLeft(() => NotFoundError("User")),
      ctx.logger.debug.logInTaskEither("User %O"),
      TE.filterOrElse(
        (e) => e.status === UserStatusApproved.value,
        () => ServerError(["User not approved"]),
      ),
      TE.chainFirst((user) =>
        pipe(
          passwordUtils.verify(password, user.passwordHash),
          TE.chain((isEqual) => {
            if (!isEqual) {
              return TE.left(BadRequestError("Password is wrong"));
            }
            return TE.right(isEqual);
          }),
        ),
      ),
      TE.chain(({ passwordHash, ...user }) =>
        TE.fromIO(
          ctx.jwt.signUser({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          }),
        ),
      ),
      TE.map((token) => ({
        body: { data: { token } },
        statusCode: 201,
      })),
    );
  });
};
