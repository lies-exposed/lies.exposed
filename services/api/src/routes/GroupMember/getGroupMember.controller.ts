import * as endpoints from "@econnessione/shared/endpoints";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toGroupMemberIO } from "./groupMember.io";

export const MakeGetGroupMemberRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.GroupMember.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(GroupMemberEntity, {
        where: { id },
        loadRelationIds: true,
      }),
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
