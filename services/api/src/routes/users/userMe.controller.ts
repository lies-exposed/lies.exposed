import { UserEntity } from "@entities/User.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { Router } from "express";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io";

export const MakeUserGetMeRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.User.Custom.GetUserMe,
    ({ query }, req) => {
      const id: any = (req.user as any)?.id;
      return pipe(
        ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(id) } }),
        TE.chainEitherK(toUserIO),
        TE.map((user) => ({
          body: user,
          statusCode: 200,
        }))
      );
    }
  );
};
