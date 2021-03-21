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
  AddEndpoint(r)(endpoints.Event.List, ({ query: { actors, ...query } }) => {
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
      ctx.db.findAndCount(EventEntity, {
        ...findOptions,
        where: {
          ...findOptions.where,
          ...(O.isSome(actors)
            ? {
                actors: { id: actors.value },
              }
            : {}),
        },
        relations: ["links", "images"],
        loadRelationIds: {
          relations: ["actors", "groups", "groupsMembers"],
        },
      }),
      TE.chain(([events, count]) =>
        sequenceS(TE.taskEither)({
          data: TE.fromEither(A.traverse(E.either)(toEventIO)(events)),
          total: TE.right(count),
        })
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
