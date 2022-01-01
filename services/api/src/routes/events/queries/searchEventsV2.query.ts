import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { In } from "typeorm";
import { RouteContext } from "../../route.types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { DBError } from "@providers/orm/Database";

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
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect('event.links', 'links'),
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

            logger.debug.log(
              `Search event v2 query %s with params %O`,
              ...q.getQueryAndParameters()
            );

            const uncategorizedCount = q
              .clone()
              .andWhere(" event.type = 'Uncategorized' ");

            logger.debug.log(
              `Uncategorized count query %O`,
              ...uncategorizedCount.getQueryAndParameters()
            );

            const deathsCount = q.clone().andWhere(" event.type = 'Death' ");

            logger.debug.log(
              `Deaths count query %O`,
              ...deathsCount.getQueryAndParameters()
            );

            const scientificStudiesCount = q
              .clone()
              .andWhere(" event.type = 'ScientificStudy' ");
            logger.debug.log(
              `Scientific Studies count query %O`,
              ...scientificStudiesCount.getQueryAndParameters()
            );
            return {
              resultsQuery: q,
              uncategorizedCount,
              deathsCount,
              scientificStudiesCount,
            };
          }
        );

        return sequenceS(TE.ApplicativePar)({
          results: db.execQuery(() =>
            searchV2Query.resultsQuery
              .skip(findOptions.skip)
              .take(findOptions.take)
              .orderBy("event.date", "DESC")
              .getMany()
          ),
          uncategorized: db.execQuery(() =>
            searchV2Query.uncategorizedCount.getCount()
          ),
          deaths: db.execQuery(() => searchV2Query.deathsCount.getCount()),
          scientificStudies: db.execQuery(() =>
            searchV2Query.scientificStudiesCount.getCount()
          ),
        });
      }),
      TE.map(({ results, ...totals }) => ({ results, totals }))
    );
  };
