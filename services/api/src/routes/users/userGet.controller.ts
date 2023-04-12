import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeUserGetRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:read"]))(
    Endpoints.User.Get,
    ({ params: { id } }, req) => {
      return pipe(
        ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(id) } }),
        TE.chainEitherK(toUserIO),
        TE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        }))
      );
    }
  );
};
