import { endpoints } from "@econnessione/shared";
import { ProjectEntity } from "@entities/Project.entity";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toProjectIO } from "./project.io";

export const MakeGetProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Project.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ProjectEntity, {
        where: { id },
        relations: ['images'],
        // loadRelationIds: true,
      }),
      TE.chainEitherK(toProjectIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
