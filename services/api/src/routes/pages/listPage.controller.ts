import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { getORMOptions } from "@utils/orm.utils";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { toPageIO } from "./page.io";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.List, ({ query }) => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: ctx.db.find(PageEntity, {
          ...getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE),
          loadRelationIds: true,
        }),
        total: ctx.db.count(PageEntity),
      }),
      TE.chain(({ data, total }) =>
        pipe(
          data,
          A.map(toPageIO),
          A.sequence(E.Applicative),
          TE.fromEither,
          TE.map((data) => ({ total, data }))
        )
      ),
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
