import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UserStatusApproved } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { UserEntity } from "#entities/User.entity.js";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import * as passwordUtils from "#utils/password.utils.js";

export const MakeUserLoginRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.User.Custom.UserLogin,
    ({ body: { username, password } }) => {
      ctx.logger.debug.log("Login user with username or email %s", username);
      // void pipe(
      //   passwordUtils.hash(password),
      //   ctx.logger.debug.logInTaskEither('Password hash %s')
      // )()
      return pipe(
        ctx.db.findOneOrFail(UserEntity, {
          where: [{ username }, { email: username }],
        }),
        TE.mapLeft(() => NotFoundError("User")),
        LoggerService.TE.debug(ctx, "User %O"),
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
    },
  );
};
