import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { RouteContext } from "../route.types";
import { authenticationHandler } from '@utils/authenticationHandler';
import { toGroupMemberIO } from "./groupMember.io";

export const MakeDeleteGroupMemberRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:delete']))(Endpoints.GroupMember.Delete, ({ params: { id } }) => {
    ctx.logger.debug.log("Delete group member %s", id);

    return pipe(
      ctx.db.findOneOrFail(GroupMemberEntity, {
        where: { id: Equal(id) },
        loadRelationIds: true,
      }),
      TE.chainFirst(() => ctx.db.softDelete(GroupMemberEntity, id)),
      TE.chainEitherK(toGroupMemberIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
