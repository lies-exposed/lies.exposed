import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { PageEntity } from "../../entities/Page.entity.js";
import { type RouteContext } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { getORMOptions } from "#utils/orm.utils.js";

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
          TE.map((data) => ({ total, data })),
        ),
      ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};
