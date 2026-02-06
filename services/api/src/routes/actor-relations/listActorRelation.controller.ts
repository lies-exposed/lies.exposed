import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { ActorRelationIO } from "@liexp/backend/lib/io/actorRelation.io.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListActorRelationRoute: Route = (r, ctx): void => {
  AddEndpoint(r)(
    Endpoints.ActorRelation.List,
    ({ query: { q: search, actor, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE,
      );

      ctx.logger.debug.log(
        `Get actor relations with find Options %O`,
        findOptions,
      );

      const listActorRelationsTE = pipe(
        ctx.db.manager.createQueryBuilder(
          ActorRelationEntity,
          "actorRelations",
        ),
        (q) => {
          q.innerJoinAndSelect("actorRelations.actor", "actor");
          q.leftJoinAndSelect("actor.avatar", "actorAvatar");
          q.innerJoinAndSelect("actorRelations.relatedActor", "relatedActor");
          q.leftJoinAndSelect("relatedActor.avatar", "relatedActorAvatar");
          return q;
        },
        (q) => {
          if (fp.O.isSome(actor)) {
            return q.andWhere(
              "(actorRelations.actorId = :actorId OR actorRelations.relatedActorId = :actorId)",
              { actorId: actor.value },
            );
          }
          return q;
        },
        (q) => {
          if (fp.O.isSome(query.type)) {
            return q.andWhere("actorRelations.type = :type", {
              type: query.type.value,
            });
          }
          return q;
        },
        (q) => {
          if (fp.O.isSome(search)) {
            const likeTerm = `%${search.value}%`;
            ctx.logger.debug.log("Searching by excerpt %s", likeTerm);
            return q.andWhere("actorRelations.excerpt LIKE :likeTerm", {
              likeTerm,
            });
          }
          return q;
        },
        (q) => {
          return ctx.db.execQuery(() =>
            q.skip(findOptions.skip).take(findOptions.take).getManyAndCount(),
          );
        },
      );

      return pipe(
        listActorRelationsTE,
        TE.chainEitherK(([results, count]) =>
          pipe(
            ActorRelationIO.decodeMany(results),
            E.map((data) => ({ data, count })),
          ),
        ),
        TE.map(({ data, count }) => ({
          body: {
            data,
            total: count,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
