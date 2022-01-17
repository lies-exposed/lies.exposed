import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { RouteContext } from "../route.types";

export const MakeDeleteGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.Delete, ({ params: { id } }) => {
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
