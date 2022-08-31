import fs from "fs";
import path from "path";
import { EventRelationIds } from "@liexp/shared/helpers/event";
import {
  getNewRelationIds,
  SearchEventsQueryCache,
  updateCache,
} from "@liexp/shared/helpers/event/search-event";
import {
  createHierarchicalEdgeBundling,
  HierarchicalEdgeBundlingProps,
} from "@liexp/shared/helpers/graph/createHierarchicalEdgeBundlingData";
import {
  Actor,
  Group,
  GroupMember,
  Keyword,
  Media,
} from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { StatsType } from "@liexp/shared/io/http/Stats";
import { DBError } from "@liexp/shared/providers/orm";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { In } from "typeorm";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError, toControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import {
  SearchEventOutput,
  searchEventV2Query,
} from "@routes/events/queries/searchEventsV2.query";
import { toGroupMemberIO } from "@routes/groups-members/groupMember.io";
import { toGroupIO } from "@routes/groups/group.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toImageIO } from "@routes/media/media.io";
import { RouteContext } from "@routes/route.types";

export const createStatsByEntityType =
  (ctx: RouteContext) =>
  (
    type: StatsType,
    id: string
  ): TE.TaskEither<ControllerError, HierarchicalEdgeBundlingProps["graph"]> => {
    const filePath = path.resolve(
      process.cwd(),
      `temp/stats/keywords/${id}.json`
    );

    ctx.logger.debug.log("Keyword stats file %s", filePath);

    const fetchRelations = ({
      actors,
      groups,
      groupsMembers,
      media,
      keywords,
    }: // links,
    EventRelationIds): TE.TaskEither<
      DBError,
      {
        actors: ActorEntity[];
        groups: GroupEntity[];
        groupsMembers: GroupMemberEntity[];
        keywords: KeywordEntity[];
        media: MediaEntity[];
      }
    > => {
      return sequenceS(TE.ApplicativePar)({
        actors:
          actors.length === 0
            ? TE.right([])
            : ctx.db.find(ActorEntity, {
                where: {
                  id: In(actors),
                },
              }),
        groups:
          groups.length === 0
            ? TE.right([])
            : ctx.db.find(GroupEntity, {
                where: {
                  id: In(groups),
                },
              }),
        groupsMembers:
          groupsMembers.length === 0
            ? TE.right([])
            : ctx.db.find(GroupMemberEntity, {
                where: {
                  id: In(groupsMembers),
                },
                relations: ["actor", "group"],
              }),
        media:
          media.length === 0
            ? TE.right([])
            : ctx.db.find(MediaEntity, {
                where: {
                  id: In(media),
                },
              }),
        keywords:
          keywords.length === 0
            ? TE.right([])
            : ctx.db.find(KeywordEntity, {
                where: {
                  id: In(keywords),
                },
              }),
      });
    };

    const searchLoop = (
      type: StatsType,
      id: string,
      acc: EventV2Entity[]
    ): TE.TaskEither<DBError, SearchEventOutput> => {
      ctx.logger.debug.log("Searching loop %d", acc.length);

      return pipe(
        searchEventV2Query(ctx)({
          actors: type === StatsType.types[1].value ? O.some([id]) : O.none,
          groups: type === StatsType.types[2].value ? O.some([id]): O.none,
          groupsMembers: O.none,
          keywords: type === StatsType.types[0].value ? O.some([id]) : O.none,
          links: O.none,
          locations: O.none,
          type: O.some(EventType.types.map((t) => t.value)),
          title: O.none,
          startDate: O.none,
          endDate: O.none,
          media: O.none,
          exclude: O.none,
          draft: O.none,
          withDeleted: false,
          withDrafts: false,
          order: {
            id: "DESC",
          },
          skip: acc.length,
          take: 100,
        }),
        TE.chain((results) => {
          ctx.logger.debug.log(
            "Search results length %d",
            results.results.length
          );
          ctx.logger.debug.log("Search results totals %O", results);

          if (results.total === 0) {
            return TE.right({
              ...results,
              results: acc,
            });
          }

          if (acc.length === results.total) {
            return TE.right({
              ...results,
              results: acc,
            });
          }

          return searchLoop(type, id, acc.concat(results.results));
        })
      );
    };

    const initialSearchEventsQueryCache: SearchEventsQueryCache = {
      events: [],
      actors: new Map(),
      groups: new Map(),
      groupsMembers: new Map(),
      media: new Map(),
      keywords: new Map(),
      // links: new Map(),
    };

    let searchEventsQueryCache: SearchEventsQueryCache =
      initialSearchEventsQueryCache;

    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          const filePathDir = path.dirname(filePath);
          const tempFolderExists = fs.existsSync(filePathDir);
          if (!tempFolderExists) {
            ctx.logger.debug.log(
              "Folder %s does not exist, creating...",
              filePathDir
            );
            fs.mkdirSync(filePathDir, { recursive: true });
          }
        }, toControllerError)
      ),
      TE.chain(() => searchLoop(type, id, [])),
      TE.chain(({ results, total, totals }) =>
        pipe(
          results,
          A.map((e) => toEventV2IO(e)),
          A.sequence(E.Applicative),
          TE.fromEither,
          TE.chain((events) => {
            return pipe(
              getNewRelationIds(events, searchEventsQueryCache),
              ctx.logger.debug.logInPipe(`new relation ids %O`),
              TE.right,
              TE.chain(fetchRelations),
              TE.map(({ actors, groups, groupsMembers, media, keywords }) => {
                searchEventsQueryCache = updateCache(searchEventsQueryCache, {
                  events: { data: events, total, totals },
                  actors: pipe(
                    actors,
                    A.map((a) => toActorIO(a)),
                    A.sequence(E.Applicative),
                    E.getOrElse((): Actor.Actor[] => [])
                  ),
                  groups: pipe(
                    groups,
                    A.map((a) => toGroupIO(a)),
                    A.sequence(E.Applicative),
                    E.getOrElse((): Group.Group[] => [])
                  ),
                  groupsMembers: pipe(
                    groupsMembers,
                    A.map(toGroupMemberIO),
                    A.sequence(E.Applicative),
                    E.getOrElse((): GroupMember.GroupMember[] => [])
                  ),
                  media: pipe(
                    media,
                    A.map(toImageIO),
                    A.sequence(E.Applicative),
                    E.getOrElse((): Media.Media[] => [])
                  ),
                  keywords: pipe(
                    keywords,
                    A.map(toKeywordIO),
                    A.sequence(E.Applicative),
                    E.getOrElse((): Keyword.Keyword[] => [])
                  ),
                  // links: links.data
                });

                return searchEventsQueryCache;
              })
            );
          })
        )
      ),
      TE.map(({ events, actors, groups }) => {
        return createHierarchicalEdgeBundling({
          relation: type,
          events,
          actors: Array.from(actors.values()),
          groups: Array.from(groups.values()),
          hideEmptyRelations: true,
        });
      }),
      TE.chainIOEitherK(({ graph }) => {
        return IOE.tryCatch(() => {
          fs.writeFileSync(filePath, JSON.stringify(graph));
          return graph;
        }, toControllerError);
      })
    );
  };
