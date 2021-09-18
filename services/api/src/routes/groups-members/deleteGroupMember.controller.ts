import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toGroupMemberIO } from "./groupMember.io";

export const MakeDeleteGroupMemberRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(Endpoints.GroupMember.Delete, ({ params: { id } }) => {
    ctx.logger.debug.log("Delete group member %s", id);

    return pipe(
      ctx.db.findOneOrFail(GroupMemberEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst(() => ctx.db.delete(GroupMemberEntity, id)),
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
