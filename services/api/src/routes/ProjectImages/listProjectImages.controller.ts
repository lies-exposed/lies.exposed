import * as endpoints from "@econnessione/shared/endpoints";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toProjectImageIO } from "./ProjectImage.io";

export const MakeListProjectImageRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(endpoints.ProjectImage.List, () => {
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
          data: data,
          total: count,
        } as any,
        statusCode: 200,
      }))
    );
  });
};
