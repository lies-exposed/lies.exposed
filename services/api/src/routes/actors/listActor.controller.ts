import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { In, Like } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity";
import { toActorIO } from "./actor.io";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { RouteContext } from "routes/route.types";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Actor.List,
    ({ query: { ids, fullName, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`Find Options %O`, findOptions);

      const where = pipe(findOptions.where, (w) => {
        if (O.isSome(ids)) {
          return {
            ...w,
            id: In(ids.value),
          };
        }
        if (O.isSome(fullName)) {
          return {
            ...w,
            fullName: Like(`%${fullName.value}%`),
          };
        }
        return w;
      });

      return pipe(
        ctx.db.findAndCount(ActorEntity, {
          ...findOptions,
          where,
          loadRelationIds: {
            relations: ["memberIn"],
          },
        }),
        TE.chain(([data, total]) =>
          pipe(
            data,
            A.traverse(E.either)(toActorIO),
            TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            }))
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
    }
  );
};
