import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { RouteContext } from "../route.types";
import { toProjectIO } from "./project.io";
import { ProjectEntity } from "@entities/Project.entity";

export const MakeGetProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Project.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ProjectEntity, {
        where: { id : Equal(id)},
        relations: ["media", "areas"],
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
