import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { GroupEntity } from "../../entities/Group.entity.js";
import { type RouteContext } from "../route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Group.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.softDelete(GroupEntity, id),
        TE.map((data) => ({
          body: {
            data: true,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
