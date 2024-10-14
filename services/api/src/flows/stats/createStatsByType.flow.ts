import fs from "fs";
import path from "path";
import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import {
  getNewRelationIds,
  toSearchEvent,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/search-event.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  EventType,
  type SearchEvent,
} from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Media,
  type Events,
  type GroupMember,
} from "@liexp/shared/lib/io/http/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
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
import { ensureFolderExists } from "#flows/fs/ensureFolderExists.flow.js";
import { LoggerService } from "#flows/logger/logger.service.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "#routes/events/queries/searchEventsV2.query.js";
import { MediaIO } from "#routes/media/media.io.js";

interface StatsCache {
  events: string[];
  actors: Map<string, number>;
  groups: Map<string, number>;
  keywords: Map<string, number>;
  groupsMembers: Map<string, GroupMember.GroupMember>;
  media: Map<string, Media.Media>;

  // links: Map<string, Link.Link>;
}

const updateMap = (
  c: Map<string, number>,
  arr: { id: string }[],
): Map<string, number> => {
  return pipe(
    arr,
    A.reduce(c, (acc, a) => {
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
  (id: string, type: "keywords" | "groups" | "actors"): TEReader<any> =>
  (ctx) => {
    const filePath = path.resolve(
      ctx.config.dirs.temp.root,
      `stats/${type}/${id}.json`,
    );

    LoggerService.debug(["%s stats file %s", filePath])(ctx);

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

    const searchEventsQueryCache: SearchEventsQueryCache =
      initialSearchEventsQueryCache;

    return pipe(
      ensureFolderExists(filePath)(ctx),
      TE.chain(() =>
        walkPaginatedRequest<SearchEventOutput, ControllerError, EventV2Entity>(
          ({ skip, amount }) =>
            searchEventV2Query({
              ids: O.none,
              actors: type === "actors" ? O.some([id as UUID]) : O.none,
              groups: type === "groups" ? O.some([id as UUID]) : O.none,
              keywords: type === "keywords" ? O.some([id as UUID]) : O.none,
              groupsMembers: O.none,
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
              ctx.logger.debug.logInPipe(`new relation ids %O`),
              TE.right,
              TE.chain(fetchRelations),
              TE.map(({ actors, groups, groupsMembers, media, keywords }) => {
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
                  A.reduce(init, (acc, e) => {
                    const searchEvent = toSearchEvent(e, {
                      media: new Map(),
                      groupsMembers: new Map(),
                      keywords: new Map(
                        keywords.map((k) => [
                          k.id as string,
                          {
                            ...k,
                            id: k.id as any,
                            color: k.color as any,
                            events: [],
                            links: [],
                            media: [],
                            socialPosts: [],
                          },
                        ]),
                      ),
                      groups: new Map(
                        groups.map((g) => [
                          g.id as string,
                          {
                            ...g,
                            username: g.username ?? undefined,
                            color: g.color as any,
                            subGroups: [],
                            startDate: g.startDate ?? undefined,
                            endDate: g.endDate ?? undefined,
                            avatar: pipe(
                              fp.O.fromNullable(g.avatar),
                              fp.O.map((avatar) =>
                                MediaIO.decodeSingle(
                                  avatar,
                                  ctx.env.SPACE_ENDPOINT,
                                ),
                              ),
                              fp.O.fold(
                                () => undefined,
                                E.getOrElse(
                                  (): Media.Media | undefined => undefined,
                                ),
                              ),
                            ),
                            members: [],
                          },
                        ]),
                      ),
                      actors: new Map(
                        actors.map((a) => [
                          a.id as string,
                          {
                            ...a,
                            death: "",
                            bornOn: (a.bornOn as any) ?? undefined,
                            diedOn: (a.diedOn as any) ?? undefined,
                            color: a.color as any,
                            avatar: pipe(
                              fp.O.fromNullable(a.avatar),
                              fp.O.map((avatar) =>
                                MediaIO.decodeSingle(
                                  avatar,
                                  ctx.env.SPACE_ENDPOINT,
                                ),
                              ),
                              fp.O.fold(
                                () => undefined,
                                E.getOrElse(
                                  (): Media.Media | undefined => undefined,
                                ),
                              ),
                            ),
                            memberIn: [],
                          },
                        ]),
                      ),
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
      TE.map((stats) => {
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
      TE.chainIOEitherK(({ stats }) => {
        return IOE.tryCatch(() => {
          fs.writeFileSync(filePath, JSON.stringify(stats));
          return stats;
        }, toControllerError);
      }),
    );
  };
