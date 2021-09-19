import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toGroupMemberIO } from "./groupMember.io";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { RouteContext } from "routes/route.types";

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

      ctx.logger.debug.log(`find Options %O`, findOptions);

      const listGroupsMembersTE = pipe(
        ctx.db.manager
          .createQueryBuilder(GroupMemberEntity, "groupsMembers")
          .leftJoinAndSelect("groupsMembers.actor", "actor")
          .leftJoinAndSelect("groupsMembers.group", "group")
          .leftJoinAndSelect("groupsMembers.events", "events"),
        (q) => {
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
