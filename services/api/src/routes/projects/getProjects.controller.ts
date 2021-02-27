import * as endpoints  from "@econnessione/shared/endpoints";
import { ProjectEntity } from "@entities/Project.entity";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toProjectIO } from "./project.io";

export const MakeListProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Project.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(ProjectEntity, { relations: ['images', 'areas'] }),
          TE.chainEitherK(A.traverse(E.either)(toProjectIO))
        ),
        count: ctx.db.count(ProjectEntity),
      }),
      // TE.mapLeft((e) => ({
      //   ...e,
      //   status: 500,
      //   details: {
      //     kind: `ServerError` as const,
      //     meta: e.details,
      //   },
      // })),
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
