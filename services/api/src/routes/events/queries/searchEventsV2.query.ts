import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { DBError } from "@providers/orm/Database";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { RouteContext } from "../../route.types";
import { In } from "typeorm";
import * as A from "fp-ts/lib/Array";

interface SearchEventQuery {
  actors: O.Option<string[]>;
  groups: O.Option<string[]>;
  groupsMembers: O.Option<string[]>;
  keywords: O.Option<string[]>;
  skip: number;
  take: number;
}

export const searchEventV2Query =
  ({ db, logger }: RouteContext) =>
  ({
    actors,
    groups,
    groupsMembers: _groupsMembers,
    keywords,
    ...findOptions
  }: SearchEventQuery): TE.TaskEither<DBError, [EventV2Entity[], number]> => {
    const groupsMembersQuery = pipe(
      O.isSome(actors)
        ? pipe(
            db.find(GroupMemberEntity, {
              where: {
                actor: { id: In(actors.value) },
              },
            }),
            TE.map(A.map((gm) => gm.id))
          )
        : TE.right<DBError, string[]>([]),
      TE.map((gm) =>
        O.isSome(_groupsMembers) ? gm.concat(..._groupsMembers.value) : gm
      )
    );

    return pipe(
      groupsMembersQuery,
      TE.chain((groupsMembers) => {
        logger.debug.log(`Groups members %O`, groupsMembers);
        return pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media"),
          (q) => {
            q.where("event.draft = :draft", { draft: false });
            let hasWhere = false;
            if (O.isSome(actors)) {
              q.where(
                `event.type = 'Uncategorized' AND "event"."payload" ::jsonb -> 'actors' @> :actors`,
                {
                  actors: `[${actors.value.map((v) => `"${v}"`).join(",")}]`,
                }
              );

              q.orWhere(
                `event.type = 'Uncategorized' AND "event"."payload" ::jsonb -> 'groupsMembers' @> :groupsMembers`,
                {
                  groupsMembers: `[${groupsMembers
                    .map((v) => `"${v}"`)
                    .join(",")}]`,
                }
              );
              hasWhere = true;
            }

            if (O.isSome(groups)) {
              const where = hasWhere ? q.orWhere.bind(q) : q.where.bind(q);
              where(
                `event.type = 'Uncategorized' AND "event"."payload" ::jsonb -> 'groups' @> :groups`,
                {
                  groups: `[${groups.value.map((v) => `"${v}"`).join(",")}]`,
                }
              );
              hasWhere = true;
            }

            if (groupsMembers.length > 0) {
              const where = hasWhere ? q.orWhere.bind(q) : q.where.bind(q);
              where(
                `event.type = 'Uncategorized' AND "event"."payload" ::jsonb -> 'groupsMembers' @> :groupsMembers`,
                {
                  groupsMembers: `[${groupsMembers
                    .map((v) => `"${v}"`)
                    .join(",")}]`,
                }
              );
              hasWhere = true;
            }

            if (O.isSome(keywords)) {
              const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
              where("keywords.id IN (:...keywords)", {
                keywords: keywords.value,
              });
            }

            return q;
          },
          (q) => {
            return q
              .skip(findOptions.skip)
              .take(findOptions.take)
              .orderBy("event.date", "DESC");
          },

          (q) => {
            logger.debug.log(
              `search event v2 query %s`,
              q.getQueryAndParameters()
            );
            return db.execQuery(() => q.getManyAndCount());
          }
        );
      })
    );
  };
