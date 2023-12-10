import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { NotAuthorizedError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeUserGetMeRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.User.Custom.GetUserMe,
    (_, req) => {
      ctx.logger.debug.log("Get user me %s", req.user?.id);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(u.id) } }),
        ),
        TE.mapLeft(() => NotAuthorizedError()),
        TE.chainEitherK(toUserIO),
        TE.map((user) => ({
          body: user,
          statusCode: 200,
        })),
      );
    },
  );
};
