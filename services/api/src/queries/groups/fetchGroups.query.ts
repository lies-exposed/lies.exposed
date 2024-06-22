import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/Option";
import type * as TE from "fp-ts/TaskEither";
import { GroupEntity } from "#entities/Group.entity.js";
import { type RouteContext } from "#routes/route.types.js";
import { addOrder, getORMOptions } from "#utils/orm.utils.js";

// import * as O from 'fp-ts/Option'

const defaultQuery: http.Group.GetGroupListQuery = {
  ids: O.none,
  q: O.none,
  members: O.none,
  _end: O.some(20 as any),
  _start: O.some(0 as any),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};
export const fetchGroups =
  ({ db, env, logger }: RouteContext) =>
  (
    query: Partial<http.Group.GetGroupListQuery>,
  ): TE.TaskEither<DBError, [GroupEntity[], number]> => {
    const {
      ids,
      members,
      q: search,
      ...otherQuery
    } = { ...defaultQuery, ...query };

    const findOptions = getORMOptions(
      { ...otherQuery, id: ids },
      env.DEFAULT_PAGE_SIZE,
    );

    logger.debug.log(`Find Options %O`, findOptions);

    return pipe(
      db.manager
        .createQueryBuilder(GroupEntity, "group")
        .leftJoinAndSelect("group.members", "members")
        .leftJoinAndSelect("members.actor", "actor"),
      (q) => {
        if (O.isSome(search)) {
          logger.debug.log("Where name is %s", search.value);
          return q.andWhere("lower(unaccent(group.name)) LIKE lower(:name)", {
            name: `%${search.value}%`,
          });
        }

        if (O.isSome(ids)) {
          logger.debug.log("Where ids %O", ids.value);
          return q.andWhere("group.id IN (:...ids)", {
            ids: ids.value,
          });
        }
        if (O.isSome(members)) {
          logger.debug.log("Where members %O", members.value);
          return q.andWhere("members.actor IN (:...members)", {
            members: members.value,
          });
        }
        return q;
      },
      (q) => {
        if (findOptions.order) {
          return addOrder(findOptions.order, q, "group");
        }
        return q;
      },
      (q) => {
        const qq = q.skip(findOptions.skip).take(findOptions.take);

        logger.debug.log(`SQL query %O`, qq.getQueryAndParameters());

        return db.execQuery(() => qq.getManyAndCount());
      },
    );
  };
