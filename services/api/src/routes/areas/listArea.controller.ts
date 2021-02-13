import { endpoints } from "@econnessione/shared";
import { AreaEntity } from "@entities/Area.entity";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from 'fp-ts/lib/Either';
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toAreaIO } from "./Area.io";

export const MakeListAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Area.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(AreaEntity, { loadRelationIds: true }),
          TE.chainEitherK(A.traverse(E.either)(toAreaIO))
        ),
        total: ctx.db.count(AreaEntity),
      }),

      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
