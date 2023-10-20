import fs from "fs";
import path from "path";
import { type DBError } from "@liexp/backend/lib/providers/orm";
import {
  getNewRelationIds,
  updateCache,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/search-event";
import {
  createHierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingProps,
} from "@liexp/shared/lib/helpers/graph/createHierarchicalEdgeBundlingData";
import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
  type Media,
  type Events,
} from "@liexp/shared/lib/io/http";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { StatsType } from "@liexp/shared/lib/io/http/Stats";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as IOE from "fp-ts/IOEither";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { In } from "typeorm";
import { ActorEntity } from "@entities/Actor.entity";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { type ControllerError, toControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import {
  type SearchEventOutput,
  searchEventV2Query,
} from "@routes/events/queries/searchEventsV2.query";
import { toGroupIO } from "@routes/groups/group.io";
import { toGroupMemberIO } from "@routes/groups-members/groupMember.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toMediaIO } from "@routes/media/media.io";

export const createStatsByEntityType: TEFlow<
  [StatsType, string],
  HierarchicalEdgeBundlingProps["graph"]
> = (ctx) => (type, id) => {
  const filePath = path.resolve(ctx.config.dirs.cwd, `temp/stats/${type}/${id}.json`);

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
    TE.fromIOEither(
      IOE.tryCatch(() => {
        const filePathDir = path.dirname(filePath);
        const tempFolderExists = fs.existsSync(filePathDir);
        if (!tempFolderExists) {
          ctx.logger.debug.log(
            "Folder %s does not exist, creating...",
            filePathDir,
          );
          fs.mkdirSync(filePathDir, { recursive: true });
        }
      }, toControllerError),
    ),
    TE.chain(() =>
      walkPaginatedRequest(ctx)<
        SearchEventOutput,
        ControllerError,
        EventV2Entity
      >(
        ({ skip, amount }) =>
          searchEventV2Query(ctx)({
            ids: O.none,
            actors: type === StatsType.types[1].value ? O.some([id]) : O.none,
            groups: type === StatsType.types[2].value ? O.some([id]) : O.none,
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
            skip,
            take: amount,
          }),
        (r) => r.total,
        (r) => r.results,
        0,
        50,
      ),
    ),
    TE.chain((results) =>
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
                events: {
                  data: events,
                  total: events.length,
                  totals: {
                    uncategorized: 0,
                    deaths: 0,
                    documentaries: 0,
                    transactions: 0,
                    scientificStudies: 0,
                    patents: 0,
                    quotes: 0,
                  },
                },
                actors: pipe(
                  actors,
                  A.map((a) => toActorIO(a)),
                  A.sequence(E.Applicative),
                  E.getOrElse((): Actor.Actor[] => []),
                ),
                groups: pipe(
                  groups,
                  A.map((a) => toGroupIO(a)),
                  A.sequence(E.Applicative),
                  E.getOrElse((): Group.Group[] => []),
                ),
                groupsMembers: pipe(
                  groupsMembers,
                  A.map(toGroupMemberIO),
                  A.sequence(E.Applicative),
                  E.getOrElse((): GroupMember.GroupMember[] => []),
                ),
                media: pipe(
                  media,
                  A.map((m) => toMediaIO(m, ctx.env.SPACE_ENDPOINT)),
                  A.sequence(E.Applicative),
                  E.getOrElse((): Media.Media[] => []),
                ),
                keywords: pipe(
                  keywords,
                  A.map(toKeywordIO),
                  A.sequence(E.Applicative),
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
