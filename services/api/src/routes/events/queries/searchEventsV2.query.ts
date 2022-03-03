import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Brackets, In } from "typeorm";
import { RouteContext } from "../../route.types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { DBError } from "@providers/orm/Database";
import { addOrder } from "@utils/orm.utils";

// const toPGArray = (els: string[]): string[] => {
//   return els.map((el) => `'${el}'`);
// };

interface SearchEventQuery {
  actors: O.Option<string[]>;
  groups: O.Option<string[]>;
  groupsMembers: O.Option<string[]>;
  keywords: O.Option<string[]>;
  links: O.Option<string[]>;
  media: O.Option<string[]>;
  type: O.Option<string[]>;
  title: O.Option<string>;
  startDate: O.Option<Date>;
  endDate: O.Option<Date>;
  withDeleted: boolean;
  withDrafts: boolean;
  skip: number;
  take: number;
  order?: { [key: string]: "ASC" | "DESC" };
}

interface SearchEventOutput {
  results: EventV2Entity[];
  totals: {
    uncategorized: number;
    deaths: number;
    scientificStudies: number;
    patents: number;
    documentaries: number;
  };
}

export const searchEventV2Query =
  ({ db, logger }: RouteContext) =>
  ({
    actors,
    groups,
    groupsMembers: _groupsMembers,
    keywords,
    media,
    links,
    type,
    title,
    startDate,
    endDate,
    withDeleted,
    withDrafts,
    order,
    skip,
    take,
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
        logger.debug.log(
          `Find options for event (type: %O) %O`,
          O.toUndefined(type),
          {
            actors,
            groups,
            groupsMembers,
            keywords,
            links,
            media,
          }
        );

        const searchV2Query = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links"),
          (q) => {
            if (!withDrafts) {
              q.where("event.draft = :draft", { draft: false });
            }

            if (withDeleted) {
              q.withDeleted();
            }

            if (O.isSome(title)) {
              q.andWhere(
                `event.type IN ('Uncategorized', 'ScientificStudy') AND "event"."payload" ->> lower('title') LIKE :title`,
                { title: `%${title.value.toLocaleLowerCase()}%` }
              );
            }

            if (O.isSome(startDate)) {
              q.andWhere("event.date >= :startDate", {
                startDate: startDate.value.toDateString(),
              });
            }

            if (O.isSome(endDate)) {
              q.andWhere("event.date <= :endDate", {
                endDate: endDate.value.toDateString(),
              });
            }

            if (O.isSome(actors)) {
              q.orWhere(
                new Brackets((qqb) => {
                  return qqb
                    .where(
                      `event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'actors' ?| ARRAY[:...actors]`,
                      {
                        actors: actors.value,
                      }
                    )
                    .orWhere(
                      `event.type = 'Death' AND "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors]`,
                      {
                        actors: actors.value,
                      }
                    )
                    .orWhere(
                      `event.type = 'Documentary' AND "event"."payload"::jsonb -> 'subjects' -> 'actors' ?| ARRAY[:...actors] OR "event"."payload"::jsonb -> 'authors' -> 'actors' ?| ARRAY[:...actors]`,
                      {
                        actors: actors.value,
                      }
                    );
                })
              );
            }

            if (O.isSome(groups)) {
              q.andWhere(
                new Brackets((qqb) => {
                  qqb
                    .where(
                      `event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groups' ?| ARRAY[:...groups]`,
                      {
                        groups: groups.value,
                      }
                    )
                    .orWhere(
                      `event.type = 'ScientificStudy' AND "event"."payload"::jsonb -> 'publisher' ?| ARRAY[:...groups]`,
                      {
                        groups: groups.value,
                      }
                    )
                    .orWhere(
                      `event.type = 'Documentary' AND "event"."payload"::jsonb -> 'subjects' -> 'groups' ?| ARRAY[:...groups] OR "event"."payload"::jsonb -> 'authors' -> 'groups' ?| ARRAY[:...groups]`,
                      {
                        groups: groups.value,
                      }
                    );
                  return qqb;
                })
              );
            }

            if (groupsMembers.length > 0) {
              q.andWhere(
                `(event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groupsMembers' ?| ARRAY[:...groupsMembers])`,
                {
                  groupsMembers: groupsMembers,
                }
              );
            }

            if (O.isSome(keywords)) {
              q.orWhere("keywords.id IN (:...keywords)", {
                keywords: keywords.value,
              });
            }

            if (O.isSome(media)) {
              q.orWhere("media.id IN (:...media)", {
                media: media.value,
              });
            }

            if (O.isSome(links)) {
              q.orWhere("links.id IN (:...links)", {
                links: links.value,
              });
            }

            if (order !== undefined) {
              addOrder(order, q, "event");
            }

            // logger.debug.log(
            //   `Search event v2 query %s with params %O`,
            //   ...q.getQueryAndParameters()
            // );

            const uncategorizedCount = q
              .clone()
              .andWhere("event.type = 'Uncategorized' ");

            // logger.debug.log(
            //   `Uncategorized count query %O`,
            //   ...uncategorizedCount.getQueryAndParameters()
            // );

            const deathsCount = q.clone().andWhere(" event.type = 'Death' ");

            // logger.debug.log(
            //   `Deaths count query %O`,
            //   ...deathsCount.getQueryAndParameters()
            // );

            const scientificStudiesCount = q
              .clone()
              .andWhere(" event.type = 'ScientificStudy' ");

            // logger.debug.log(
            //   `Scientific Studies count query %O`,
            //   ...scientificStudiesCount.getQueryAndParameters()
            // );
            const patentCount = q.clone().andWhere("event.type = 'Patent'");

            const documentariesCount = q
              .clone()
              .andWhere("event.type = 'Documentary'");

            // logger.debug.log(
            //   `Documentary count query %O`,
            //   ...documentariesCount.getQueryAndParameters()
            // );

            if (O.isSome(type)) {
              q.andWhere("event.type::text IN (:...types)", {
                types: type.value,
              });
            }

            return {
              resultsQuery: q,
              uncategorizedCount,
              deathsCount,
              scientificStudiesCount,
              patentCount,
              documentariesCount,
            };
          }
        );

        return sequenceS(TE.ApplicativePar)({
          results: db.execQuery(() =>
            searchV2Query.resultsQuery
              .loadAllRelationIds({ relations: ["keywords", "links", "media"] })
              .skip(skip)
              .take(take)
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
          patents: db.execQuery(() => searchV2Query.patentCount.getCount()),
          documentaries: db.execQuery(() =>
            searchV2Query.documentariesCount.getCount()
          ),
        });
      }),
      TE.map(({ results, ...totals }) => ({ results, totals }))
    );
  };
