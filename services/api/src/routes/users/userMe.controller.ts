import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeUserGetMeRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.User.Custom.GetUserMe,
    ({ query }, req) => {
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(u.id as any) } })
        ),
        TE.chainEitherK(toUserIO),
        TE.map((user) => ({
          body: user,
          statusCode: 200,
        }))
      );
    }
  );
};
