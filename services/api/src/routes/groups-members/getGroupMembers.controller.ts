import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "../route.types";
import { toGroupMemberIO } from "./groupMember.io";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListGroupMemberRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(
    Endpoints.GroupMember.List,
    ({ query: { search, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(
        `Get groups members with find Options %O`,
        findOptions
      );

      const listGroupsMembersTE = pipe(
        ctx.db.manager
          .createQueryBuilder(GroupMemberEntity, "groupsMembers")
          .leftJoinAndSelect("groupsMembers.actor", "actor"),
        // .leftJoinAndSelect("groupsMembers.events", "events"),
        (q) => {
          if (O.isSome(query.group)) {
            return q.innerJoinAndSelect(
              "groupsMembers.group",
              "group",
              "group.id = :groupId",
              {
                groupId: query.group.value,
              }
            );
          }
          return q.innerJoinAndSelect("groupsMembers.group", "group");
        },
        (q) => {
          ctx.logger.debug.log("Ids %O", query.ids);
          if (query.ids._tag === "Some") {
            return q.andWhere("groupsMembers.id IN (:...ids)", {
              ids: query.ids.value,
            });
          }
          if (search._tag === "Some") {
            const likeTerm = `%${search.value}%`;
            ctx.logger.debug.log("Searching by actor.fullName %s", likeTerm);
            return q.andWhere("actor.fullName LIKE :likeTerm", { likeTerm });
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
            q.skip(findOptions.skip).take(findOptions.take).getManyAndCount()
          );
        }
      );

      return pipe(
        listGroupsMembersTE,
        TE.chainEitherK(([results, count]) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toGroupMemberIO),
            E.map((data) => ({ data, count }))
          )
        ),
        TE.map(({ data, count }) => ({
          body: {
            data: data,
            total: count,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
