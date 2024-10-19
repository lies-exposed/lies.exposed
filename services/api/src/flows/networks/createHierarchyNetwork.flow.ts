import fs from "fs";
import path from "path";
import { ensureFolderExists } from "@liexp/backend/lib/flows/fs/ensureFolderExists.flow.js";
import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  getNewRelationIds,
  updateCache,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/search-event.js";
import {
  createHierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingProps,
} from "@liexp/shared/lib/helpers/graph/createHierarchicalEdgeBundlingData.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { EventTotalsMonoid } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import {
  type Actor,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { ActorIO } from "#routes/actors/actor.io.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "#routes/events/queries/searchEventsV2.query.js";
import { GroupIO } from "#routes/groups/group.io.js";
import { GroupMemberIO } from "#routes/groups-members/groupMember.io.js";
import { KeywordIO } from "#routes/keywords/keyword.io.js";
import { MediaIO } from "#routes/media/media.io.js";

export const createStatsByEntityType =
  (
    type: StatsType,
    id: string,
  ): TEReader<HierarchicalEdgeBundlingProps["graph"]> =>
  (ctx) => {
    const filePath = path.resolve(
      ctx.config.dirs.cwd,
      `temp/stats/${type}/${id}.json`,
    );

    ctx.logger.debug.log("%s stats file %s", type, filePath);

    const fetchRelations = ({
      actors,
      groups,
      groupsMembers,
      media,
      keywords,
    }: // links,
    Events.EventRelationIds): TE.TaskEither<
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

    const initialSearchEventsQueryCache: SearchEventsQueryCache = {
      events: [],
      actors: new Map(),
      groups: new Map(),
      groupsMembers: new Map(),
      media: new Map(),
      keywords: new Map(),
      links: new Map(),
      areas: new Map(),
    };

    let searchEventsQueryCache: SearchEventsQueryCache =
      initialSearchEventsQueryCache;

    return pipe(
      ensureFolderExists(filePath)(ctx),
      TE.chain(() =>
        walkPaginatedRequest<SearchEventOutput, ControllerError, EventV2Entity>(
          ({ skip, amount }) =>
            searchEventV2Query({
              ids: O.none,
              actors:
                type === StatsType.types[1].value
                  ? O.some([id as UUID])
                  : O.none,
              groups:
                type === StatsType.types[2].value
                  ? O.some([id as UUID])
                  : O.none,
              groupsMembers: O.none,
              keywords:
                type === StatsType.types[0].value
                  ? O.some([id as UUID])
                  : O.none,
              links: O.none,
              locations: O.none,
              type: O.some(EventType.types.map((t) => t.value)),
              q: O.none,
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
              skip,
              take: amount,
            })(ctx),
          (r) => r.total,
          (r) => TE.right(r.results),
          0,
          50,
        )(ctx),
      ),
      TE.chain((results) =>
        pipe(
          results,
          EventV2IO.decodeMany,
          TE.fromEither,
          TE.chain((events) => {
            return pipe(
              getNewRelationIds(events, searchEventsQueryCache),
              TE.right,
              LoggerService.TE.debug(ctx, `new relation ids %O`),
              TE.chain(fetchRelations),
              TE.map(({ actors, groups, groupsMembers, media, keywords }) => {
                searchEventsQueryCache = updateCache(searchEventsQueryCache, {
                  events: {
                    data: events,
                    total: events.length,
                    totals: EventTotalsMonoid.empty,
                  },
                  actors: pipe(
                    ActorIO.decodeMany(actors, ctx.env.SPACE_ENDPOINT),
                    E.getOrElse((): Actor.Actor[] => []),
                  ),
                  groups: pipe(
                    GroupIO.decodeMany(groups, ctx.env.SPACE_ENDPOINT),
                    E.getOrElse((): Group.Group[] => []),
                  ),
                  groupsMembers: pipe(
                    GroupMemberIO.decodeMany(
                      groupsMembers,
                      ctx.env.SPACE_ENDPOINT,
                    ),
                    E.getOrElse((): GroupMember.GroupMember[] => []),
                  ),
                  media: pipe(
                    MediaIO.decodeMany(media, ctx.env.SPACE_ENDPOINT),
                    E.getOrElse((): Media.Media[] => []),
                  ),
                  keywords: pipe(
                    keywords,
                    KeywordIO.decodeMany,
                    E.getOrElse((): Keyword.Keyword[] => []),
                  ),
                  links: [],
                  areas: [],
                });

                return searchEventsQueryCache;
              }),
            );
          }),
        ),
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
      }),
    );
  };
