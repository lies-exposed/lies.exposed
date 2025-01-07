import { pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { type Int } from "io-ts";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { GroupEntity } from "../../entities/Group.entity.js";
import { type DBError } from "../../providers/orm/index.js";
import { addOrder, getORMOptions } from "../../utils/orm.utils.js";

// import * as O from 'fp-ts/lib/Option.js'

const defaultQuery: http.Group.GetGroupListQuery = {
  ids: O.none,
  q: O.none,
  members: O.none,
  _end: O.some(20 as Int),
  _start: O.some(0 as Int),
  _order: O.some("DESC"),
  _sort: O.some("createdAt"),
};
export const fetchGroups =
  (query: Partial<http.Group.GetGroupListQuery>) =>
  <C extends DatabaseContext & ENVContext & LoggerContext>({
    db,
    env,
    logger,
  }: C): TE.TaskEither<DBError, [GroupEntity[], number]> => {
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
        .leftJoinAndSelect("group.avatar", "avatar")
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
