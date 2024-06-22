import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

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
        })),
      );
    },
  );
};
