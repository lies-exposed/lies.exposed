import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { DBError } from "@providers/orm/Database";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { In } from "typeorm";
import { RouteContext } from "../../route.types";

// const toPGArray = (els: string[]): string[] => {
//   return els.map((el) => `'${el}'`);
// };

interface SearchEventQuery {
  actors: O.Option<string[]>;
  groups: O.Option<string[]>;
  groupsMembers: O.Option<string[]>;
  keywords: O.Option<string[]>;
  skip: number;
  take: number;
}

interface SearchEventOutput {
  results: EventV2Entity[];
  totals: {
    uncategorized: number;
    deaths: number;
    scientificStudies: number;
  };
}

export const searchEventV2Query =
  ({ db, logger }: RouteContext) =>
  ({
    actors,
    groups,
    groupsMembers: _groupsMembers,
    keywords,
    ...findOptions
  }: SearchEventQuery): TE.TaskEither<DBError, SearchEventOutput> => {
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
        logger.debug.log(`Find options %O`, {
          actors,
          groups,
          groupsMembers,
          ...findOptions,
        });

        const searchV2Query = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media"),
          (q) => {
            q.where("event.draft = :draft", { draft: false });
            let hasWhere = false;
            if (O.isSome(actors)) {
              q.where(
                `(event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'actors' ?| ARRAY[:...actors])`,
                {
                  actors: actors.value,
                }
              );
              hasWhere = true;
            }

            if (O.isSome(groups)) {
              const where = hasWhere ? q.orWhere.bind(q) : q.where.bind(q);
              where(
                `(event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groups' ?| ARRAY[:...groups])`,
                {
                  groups: groups.value,
                }
              );
              hasWhere = true;
            }

            if (groupsMembers.length > 0) {
              const where = hasWhere ? q.orWhere.bind(q) : q.where.bind(q);
              where(
                `(event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groupsMembers' ?| ARRAY[:...groupsMembers])`,
                {
                  groupsMembers: groupsMembers,
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

            const [sql, params] = q.getQueryAndParameters();
            logger.debug.log(
              `search event v2 query %s with params %O`,
              sql,
              params
            );
            return q;
          }
        );

        return sequenceS(TE.ApplicativePar)({
          results: db.execQuery(() =>
            searchV2Query
              .clone()
              .skip(findOptions.skip)
              .take(findOptions.take)
              .orderBy("event.date", "DESC")
              .getMany()
          ),
          uncategorized: db.execQuery(() =>
            searchV2Query
              .clone()
              .andWhere(" event.type = 'Uncategorized' ")
              .getCount()
          ),
          deaths: db.execQuery(() =>
            searchV2Query
              .clone()
              .addSelect("event.type")
              .andWhere(" event.type = 'Death' ")
              .getCount()
          ),
          scientificStudies: db.execQuery(() =>
            searchV2Query
              .clone()
              .addSelect("event.type")
              .andWhere(" event.type = 'ScientificStudy' ")
              .getCount()
          ),
        });
      }),
      TE.map(({ results, ...totals }) => ({ results, totals }))
    );
  };
