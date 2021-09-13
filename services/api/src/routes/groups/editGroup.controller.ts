import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";

export const MakeEditGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.update(GroupEntity, id, body),
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
