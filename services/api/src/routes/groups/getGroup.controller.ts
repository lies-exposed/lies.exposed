import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";
import { RouteContext } from "routes/route.types";

export const MakeGetGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(GroupEntity, {
        where: { id },
        loadRelationIds: true,
      }),
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
