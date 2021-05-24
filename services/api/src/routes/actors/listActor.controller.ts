import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { ActorEntity } from "../../entities/Actor.entity";
import { toActorIO } from "./actor.io";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Actor.List, ({ query: { ids, ...query } }) => {
    const findOptions = getORMOptions(
      { ...query, id: ids },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    ctx.logger.debug.log(`Find Options %O`, findOptions);

    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(ActorEntity, {
            ...findOptions,
            loadRelationIds: true,
          }),
          TE.chainEitherK(A.traverse(E.either)(toActorIO))
        ),
        total: ctx.db.count(ActorEntity),
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
