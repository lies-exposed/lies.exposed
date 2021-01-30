import { endpoints } from "@econnessione/shared";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";

export const MakeListGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Group.List, ({ query: { ids, ...query } }) => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(GroupEntity, {
            ...getORMOptions(
              { ...query, id: ids },
              ctx.env.DEFAULT_PAGE_SIZE
            ),
            loadRelationIds: true,
          }),
          TE.chainEitherK(A.traverse(E.either)(toGroupIO))
        ),
        count: ctx.db.count(GroupEntity),
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
