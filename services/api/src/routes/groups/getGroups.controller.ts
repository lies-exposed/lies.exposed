import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { GroupEntity } from "./group.entity";
import { toGroupIO } from "./group.io";

export const MakeListGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Group.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(GroupEntity, { loadRelationIds: true }),
          TE.chainEitherK(A.traverse(E.either)(toGroupIO))
        ),
        count: ctx.db.count(GroupEntity),
      }),
      TE.mapLeft((e) => ({
        ...e,
        status: 500,
        details: {
          kind: `ServerError` as const,
          meta: e.details,
        },
      })),
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
