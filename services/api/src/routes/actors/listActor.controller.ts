import * as endpoints from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ActorEntity } from "../../entities/Actor.entity";
import { toActorIO } from "./actor.io";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Actor.List, ({ query }) => {
    const findOptions = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(ActorEntity, { ...findOptions, loadRelationIds: true }),
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
