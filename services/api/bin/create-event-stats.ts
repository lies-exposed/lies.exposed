import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from "@entities/Media.entity";
import { EventRelationIds } from "@liexp/shared/helpers/event";
import { createHierarchicalEdgeBundling } from "@liexp/shared/helpers/graph/createHierarchicalEdgeBundlingData";
import { EventType } from "@liexp/shared/io/http/Events";
import { DBError } from "@liexp/shared/providers/orm";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { toEventV2IO } from "@routes/events/eventV2.io";
import {
  SearchEventOutput,
  searchEventV2Query,
} from "@routes/events/queries/searchEventsV2.query";
import dotenv from "dotenv";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { PathReporter } from "io-ts/lib/PathReporter";
import { In } from "typeorm";
import { makeContext } from "../src/server";
import {
  SearchEventsQueryCache,
  getNewRelationIds,
  updateCache,
} from "@liexp/shared/helpers/event/search-event";
import { toActorIO } from "@routes/actors/actor.io";
import {
  Actor,
  Group,
  GroupMember,
  Keyword,
  Media,
} from "@liexp/shared/io/http";
import { toGroupIO } from "@routes/groups/group.io";
import { toGroupMemberIO } from "@routes/groups-members/groupMember.io";
import { toImageIO } from "@routes/media/media.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import fs from "fs";
import path from "path";

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

const run = async () => {
  const [, , id] = process.argv;

  dotenv.config();

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

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
    id: string,
    acc: EventV2Entity[]
  ): TE.TaskEither<DBError, SearchEventOutput> => {
    ctx.logger.debug.log("Searching loop %d", acc.length);

    return pipe(
      searchEventV2Query(ctx)({
        actors: O.none,
        groups: O.none,
        groupsMembers: O.none,
        keywords: O.some([id]),
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

        return searchLoop(id, acc.concat(results.results));
      })
    );
  };

  const result = await pipe(
    searchLoop(id, []),
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
        relation: "keyword",
        events: events,
        actors: Array.from(actors.values()),
        groups: Array.from(groups.values()),
        hideEmptyRelations: true,
      });
    })
  )();

  if (result._tag === "Left") {
    ctx.logger.error.log("Error %O", result.left);
    ctx.logger.error.log(
      "Details %O",
      PathReporter.report((result.left.details as any).errors)
    );
  } else {
    ctx.logger.info.log("Output: %O", result.right);
    fs.writeFileSync(
      path.resolve(__dirname, `../temp/stats/keywords/${id}.json`),
      JSON.stringify(result.right.graph)
    );
  }
};

run().catch(console.error);
