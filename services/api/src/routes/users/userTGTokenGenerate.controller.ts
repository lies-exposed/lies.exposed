import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from '@liexp/shared/lib/utils/uuid.js';
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { UserEntity } from "#entities/User.entity.js";
import { NotAuthorizedError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeUserTGTokenGenerateRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.User.Custom.UserTGTokenGenerate,
    (_, req) => {
      ctx.logger.debug.log("Edit user me %s", req.user?.id);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(u.id) } }),
        ),
        TE.mapLeft(() => NotAuthorizedError()),
        TE.map((user) => ({ user, telegramToken: uuid()})),
        TE.chainFirst(({user, telegramToken }) => {
          ctx.logger.debug.log("User found %s", user.id);
          return ctx.db.save(UserEntity, [{
            ...user,
            telegramToken,
          }]);
        }),
        TE.map(({ telegramToken }) => ({
          body: { data: { token: telegramToken} },
          statusCode: 200,
        })),
      );
    },
  );
};
