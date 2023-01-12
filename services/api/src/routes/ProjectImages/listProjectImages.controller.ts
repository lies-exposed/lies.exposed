import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { RouteContext } from "../route.types";
import { toProjectImageIO } from "./ProjectImage.io";

export const MakeListProjectImageRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(Endpoints.ProjectImage.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(ProjectImageEntity, {
            relations: ["image", "project"],
          }),
          TE.chainEitherK(A.traverse(E.either)(toProjectImageIO))
        ),
        count: ctx.db.count(ProjectImageEntity),
      }),
      TE.map(({ data, count }) => ({
        body: {
          data,
          total: count,
        } as any,
        statusCode: 200,
      }))
    );
  });
};
