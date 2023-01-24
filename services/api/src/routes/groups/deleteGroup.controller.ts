import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { GroupEntity } from "../../entities/Group.entity";
import { type RouteContext } from "../route.types";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeDeleteGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:delete']))(Endpoints.Group.Delete, ({ params: { id } }) => {
    return pipe(
      ctx.db.softDelete(GroupEntity, id),
      TE.map((data) => ({
        body: {
          data: true,
        },
        statusCode: 200,
      }))
    );
  });
};
