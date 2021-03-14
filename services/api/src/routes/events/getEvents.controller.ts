import * as endpoints from "@econnessione/shared/endpoints";
import { EventEntity } from "@entities/Event.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toEventIO } from "./event.io";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Event.List, ({ query }) => {
    ctx.logger.info.log("Query %O", query);
    const findOptions = getORMOptions(
      {
        ...query,
        _sort: pipe(
          query._sort,
          O.alt(() => O.some("startDate"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(EventEntity, {
            ...findOptions,
            relations: ["links", "images"],
            loadRelationIds: {
              relations: ["actors", "groups"],
            },
          }),
          TE.chainEitherK(A.traverse(E.either)(toEventIO))
        ),
        total: ctx.db.count(EventEntity),
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
