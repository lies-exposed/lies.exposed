import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { UserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeUserEditMeRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(["event-suggestion:create"])(ctx))(
    Endpoints.User.Custom.EditUserMe,
    ({ body }, req) => {
      ctx.logger.debug.log("Get user me %s", req.user?.id);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(u.id) } }),
        ),
        TE.chain((u) => ctx.db.save(UserEntity, [{ ...u, ...body }])),
        TE.map((users) => users[0]),
        TE.chainEitherK(UserIO.decodeSingle),
        TE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        })),
      );
    },
  );
};
