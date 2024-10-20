import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type RouteContext } from "../route.types.js";
import { GroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeListGroupMemberRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(
    Endpoints.GroupMember.List,
    ({ query: { q: search, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE,
      );

      ctx.logger.debug.log(
        `Get groups members with find Options %O`,
        findOptions,
      );

      const listGroupsMembersTE = pipe(
        ctx.db.manager.createQueryBuilder(GroupMemberEntity, "groupsMembers"),
        (q) => {
          if (O.isSome(query.group)) {
            q.innerJoinAndSelect(
              "groupsMembers.group",
              "group",
              "group.id = :groupId",
              {
                groupId: query.group.value,
              },
            );
          } else {
            q.innerJoinAndSelect("groupsMembers.group", "group");
          }

          q.leftJoinAndSelect("group.avatar", "groupAvatar");

          if (O.isSome(query.actor)) {
            q.innerJoinAndSelect(
              "groupsMembers.actor",
              "actor",
              "actor.id = :actorId",
              {
                actorId: query.actor.value,
              },
            );
          } else {
            q.innerJoinAndSelect("groupsMembers.actor", "actor");
          }

          q.leftJoinAndSelect("actor.avatar", "actorAvatar");

          return q;
        },
        (q) => {
          ctx.logger.debug.log("Ids %O", query.ids);
          if (fp.O.isSome(query.ids)) {
            return q.andWhere("groupsMembers.id IN (:...ids)", {
              ids: query.ids.value,
            });
          }
          if (fp.O.isSome(search)) {
            const likeTerm = `%${search.value}%`;
            ctx.logger.debug.log("Searching by excerpt %s", likeTerm);
            return q.andWhere("groupsMembers.excerpt LIKE :likeTerm", {
              likeTerm,
            });
          }
          return q;
        },
        (q) => {
          // ctx.logger.debug.log(
          //   "Get groups query %s, %O",
          //   q.getSql(),
          //   q.getParameters()
          // );
          return ctx.db.execQuery(() =>
            q.skip(findOptions.skip).take(findOptions.take).getManyAndCount(),
          );
        },
      );

      return pipe(
        listGroupsMembersTE,
        TE.chainEitherK(([results, count]) =>
          pipe(
            GroupMemberIO.decodeMany(results, ctx.env.SPACE_ENDPOINT),
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
