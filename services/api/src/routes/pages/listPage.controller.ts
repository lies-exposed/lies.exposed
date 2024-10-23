import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { PageEntity } from "../../entities/Page.entity.js";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeListPageRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Page.List, ({ query }) => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
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
