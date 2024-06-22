import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { type RouteContext } from "../route.types.js";
import { toProjectImageIO } from "./ProjectImage.io.js";
import { ProjectImageEntity } from "#entities/ProjectImage.entity.js";

export const MakeListProjectImageRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(Endpoints.ProjectImage.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(ProjectImageEntity, {
            relations: ["image", "project"],
          }),
          TE.chainEitherK(A.traverse(E.Applicative)(toProjectImageIO)),
        ),
        count: ctx.db.count(ProjectImageEntity),
      }),
      TE.map(({ data, count }) => ({
        body: {
          data,
          total: count,
        } as any,
        statusCode: 200,
      })),
    );
  });
};
