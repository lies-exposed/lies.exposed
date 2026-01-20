import fs from "fs";
import path from "path";
import { type EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { ensureFolderExists } from "@liexp/backend/lib/flows/fs/ensureFolderExists.flow.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fetchRelations } from "@liexp/backend/lib/queries/common/fetchRelations.query.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  getNewRelationIds,
  EventsMapper,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/events-mapper.helper.js";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { type UUID } from "@liexp/io/lib/http/Common/index.js";
import {
  EventType,
  type SearchEvent,
} from "@liexp/io/lib/http/Events/index.js";
import {
  type GroupMember,
  type Media,
} from "@liexp/io/lib/http/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "effect/Option";
import { toWorkerError, type WorkerError } from "../../io/worker.error.js";
import { type RTE } from "../../types.js";

interface StatsCache {
  events: readonly string[];
  actors: Map<string, number>;
  groups: Map<string, number>;
  keywords: Map<string, number>;
  groupsMembers: Map<string, GroupMember.GroupMember>;
  media: Map<string, Media.Media>;
}

const updateMap = (
  c: Map<string, number>,
  arr: readonly { id: string }[],
): Map<string, number> => {
  return pipe(
    arr,
    fp.A.reduce(c, (acc, a) => {
      return pipe(
        acc,
        fp.Map.lookup(fp.S.Eq)(a.id),
        fp.O.getOrElse(() => 0),
        (count) => {
          return fp.Map.upsertAt(fp.S.Eq)(a.id, count + 1)(acc);
        },
      );
    }),
  );
};

const updateCache = (s: StatsCache, e: SearchEvent.SearchEvent): StatsCache => {
  const {
    actors: eventActors,
    groups: eventGroups,
    keywords: eventKeywords,
  } = getSearchEventRelations(e);

  const actors = updateMap(s.actors, eventActors);
  const groups = updateMap(s.groups, eventGroups);
  const keywords = updateMap(s.keywords, eventKeywords);

  return {
    events: s.events.concat(e.id),
    actors,
    groups,
    keywords,
    groupsMembers: new Map(),
    media: new Map(),
  };
};

export const createStatsByType =
  (id: string, type: "keywords" | "groups" | "actors"): RTE<any> =>
  (ctx) => {
    const filePath = path.resolve(
      ctx.config.dirs.temp.root,
      `stats/${type}/${id}.json`,
    );

    LoggerService.debug(["%s stats file %s", filePath])(ctx);

    const initialSearchEventsQueryCache: SearchEventsQueryCache = {
      events: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      media: [],
      keywords: [],
      links: [],
      areas: [],
    };

    const searchEventsQueryCache: SearchEventsQueryCache =
      initialSearchEventsQueryCache;

    return pipe(
      ensureFolderExists(filePath)(ctx),
      fp.TE.chain(() =>
        walkPaginatedRequest<SearchEventOutput, WorkerError, EventV2Entity>(
          ({ skip, amount }) =>
            searchEventV2Query({
              ids: O.none(),
              actors: type === "actors" ? O.some([id as UUID]) : O.none(),
              groups: type === "groups" ? O.some([id as UUID]) : O.none(),
              keywords: type === "keywords" ? O.some([id as UUID]) : O.none(),
              groupsMembers: O.none(),
              links: O.none(),
              locations: O.none(),
              type: O.some(EventType.members.map((t) => t.literals[0])),
              q: O.none(),
              startDate: O.none(),
              endDate: O.none(),
              media: O.none(),
              exclude: O.none(),
              draft: O.none(),
              withDeleted: false,
              withDrafts: false,
              order: {
                id: "DESC",
              },
              skip,
              take: amount,
            })(ctx),
          (r) => r.total,
          (r) => fp.TE.right(r.results),
          0,
          50,
        )(ctx),
      ),
      fp.TE.chain((results) =>
        pipe(
          results,
          EventV2IO.decodeMany,
          fp.TE.fromEither,
          fp.TE.chain((events) => {
            return pipe(
              getNewRelationIds(events, searchEventsQueryCache),
              fp.TE.right,
              LoggerService.TE.debug(ctx, `new relation ids %O`),
              fp.TE.chain(
                ({ actors, groups, keywords, links, media, groupsMembers }) =>
                  fetchRelations(
                    {
                      actors: pipe(
                        actors,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                      groups: pipe(
                        groups,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                      keywords: pipe(
                        keywords,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                      links: pipe(
                        links,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                      groupsMembers: pipe(
                        groupsMembers,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                      media: pipe(
                        media,
                        O.fromNullable,
                        O.filter(fp.A.isNonEmpty),
                      ),
                    },
                    false,
                  )(ctx),
              ),
              fp.TE.map(({ actors, groups, media: _media, keywords }) => {
                const init: StatsCache = {
                  events: [],
                  media: new Map(),
                  actors: new Map(actors.map((a) => [a.id as string, 0])),
                  groups: new Map(groups.map((a) => [a.id as string, 0])),
                  keywords: new Map(keywords.map((k) => [k.id as string, 0])),
                  groupsMembers: new Map(),
                };
                const result = pipe(
                  events,
                  fp.A.reduce(init, (acc, e) => {
                    const searchEvent = EventsMapper.toSearchEvent(e, {
                      areas: [],
                      media: [],
                      groupsMembers: [],
                      keywords: keywords.map((k) => ({
                        ...k,
                        color: k.color ?? generateRandomColor(),
                        events: [],
                        links: [],
                        media: [],
                        socialPosts: [],
                      })),
                      groups: groups.map((g) => ({
                        ...g,
                        username: g.username ?? undefined,
                        subGroups: [],
                        startDate: g.startDate ?? undefined,
                        endDate: g.endDate ?? undefined,
                        avatar: pipe(
                          fp.O.fromNullable(g.avatar),
                          fp.O.map((avatar) => MediaIO.decodeSingle(avatar)),
                          fp.O.fold(
                            () => undefined,
                            fp.E.getOrElse(
                              (): Media.Media | undefined => undefined,
                            ),
                          ),
                        ),
                        members: [],
                      })),
                      actors: actors.map((a) => ({
                        ...a,
                        death: a.death ?? undefined,
                        bornOn: a.bornOn ?? undefined,
                        diedOn: a.diedOn ?? undefined,
                        avatar: pipe(
                          fp.O.fromNullable(a.avatar as MediaEntity),
                          fp.O.map((avatar) => MediaIO.decodeSingle(avatar)),
                          fp.O.fold(
                            () => undefined,
                            fp.E.getOrElse(
                              (): Media.Media | undefined => undefined,
                            ),
                          ),
                        ),
                        memberIn: [],
                        nationalities: [],
                      })),
                    });

                    return updateCache(acc, searchEvent);
                  }),
                );

                return result;
              }),
            );
          }),
        ),
      ),
      fp.TE.map((stats) => {
        return {
          stats: {
            actors: fp.Map.toArray(fp.S.Ord)(stats.actors)
              .filter(([actorId]) =>
                type === "actors" ? id !== actorId : true,
              )
              .reduce((acc, [k, n]) => ({ ...acc, [k]: n }), {}),
            groups: fp.Map.toArray(fp.S.Ord)(stats.groups)
              .filter(([gId]) => (type === "groups" ? id !== gId : true))
              .reduce((acc, [k, n]) => ({ ...acc, [k]: n }), {}),
            keywords: fp.Map.toArray(fp.S.Ord)(stats.keywords)
              .filter(([kId]) => (type === "keywords" ? id !== kId : true))
              .reduce((acc, [k, n]) => ({ ...acc, [k]: n }), {}),
          },
        };
      }),
      fp.TE.chainIOEitherK(({ stats }) => {
        return fp.IOE.tryCatch(() => {
          fs.writeFileSync(filePath, JSON.stringify(stats));
          return stats;
        }, toWorkerError);
      }),
    );
  };
