import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toGroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteGroupMemberRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.GroupMember.Delete,
    ({ params: { id } }) => {
      ctx.logger.debug.log("Delete group member %s", id);

      return pipe(
        ctx.db.findOneOrFail(GroupMemberEntity, {
          where: { id: Equal(id) },
          relations: ["actor", "group"],
        }),
        TE.chainFirst(() => ctx.db.softDelete(GroupMemberEntity, id)),
        TE.chainEitherK(toGroupMemberIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
