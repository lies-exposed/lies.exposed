import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import {
  ServerError,
  toBadRequestError,
  toNotFoundError,
} from "@liexp/backend/lib/errors/index.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import * as passwordUtils from "@liexp/backend/lib/utils/password.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UserStatusApproved } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  toControllerError,
  type ControllerError,
} from "../../io/ControllerError.js";
import { type TEControllerError } from "../../types/TEControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

const isPasswordParam = (p: unknown): p is { password: string } => {
  return typeof p === "object" && !!p && "password" in p ? !!p.password : false;
};

export const MakeUserLoginRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.User.Custom.UserLogin,
    ({ body: { username, ...rest } }) => {
      ctx.logger.debug.log("Login user with username or email %s", username);
      // void pipe(
      //   passwordUtils.hash(password),
      //   ctx.logger.debug.logInTaskEither('Password hash %s')
      // )()
      return pipe(
        ctx.db.findOneOrFail(UserEntity, {
          where: [{ username }, { email: username }],
        }),
        TE.mapLeft(() => toControllerError(toNotFoundError("User"))),
        LoggerService.TE.debug(ctx, "User %O"),
        TE.filterOrElse(
          (e) => e.status === UserStatusApproved.value,
          () => toControllerError(ServerError.of(["User not approved"])),
        ),
        TE.chainFirst((user): TEControllerError<boolean> => {
          if (isPasswordParam(rest)) {
            return pipe(
              passwordUtils.verify(rest.password, user.passwordHash),
              TE.chain((isEqual) => {
                if (!isEqual) {
                  return TE.left(toBadRequestError("Password is wrong"));
                }
                return TE.right(isEqual);
              }),
              TE.mapLeft(toControllerError),
            );
          }

          return TE.right(user.telegramToken === rest.token);
        }),
        TE.chain(({ passwordHash, ...user }) =>
          pipe(
            TE.fromIO<string, ControllerError>(
              ctx.jwt.signUser({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
              }),
            ),
            TE.map((token) => ({ token, id: user.id })),
          ),
        ),
        TE.map((data) => ({
          body: { data },
          statusCode: 201,
        })),
      );
    },
  );
};
