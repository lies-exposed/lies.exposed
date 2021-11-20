import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";
import { RouteContext } from "@routes/route.types";

export const MakeEditGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.Edit, ({ params: { id }, body }) => {
    ctx.logger.debug.log("Updating group with %O", body);

    const groupUpdate = {
      ...body,
      members: body.members.map((id) => ({ id })),
    };
    return pipe(
      ctx.db.save(GroupEntity, [{ id, ...groupUpdate }]),
      TE.chain(() =>
        ctx.db.findOneOrFail(GroupEntity, {
          where: { id },
          loadRelationIds: true,
        })
      ),
      ctx.logger.debug.logInTaskEither("Updated group %O"),
      TE.chainEitherK(toGroupIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
