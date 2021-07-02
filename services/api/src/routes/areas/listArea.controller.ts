import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { AreaEntity } from "@entities/Area.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toAreaIO } from "./Area.io";

export const MakeListAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Area.List, ({ query }) => {
    const findOptions = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(AreaEntity, { ...findOptions, loadRelationIds: true }),
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
