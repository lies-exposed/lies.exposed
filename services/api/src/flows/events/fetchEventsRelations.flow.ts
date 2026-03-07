import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type ENVContext } from "@liexp/backend/lib/context/env.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fetchRelations } from "@liexp/backend/lib/queries/common/fetchRelations.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { isNonEmpty } from "@liexp/core/lib/fp/utils/NonEmptyArray.utils.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event.helper.js";
import * as O from "effect/Option";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { type ENV } from "../../io/ENV.js";
import { type TEReader } from "#flows/flow.types.js";

export type RelationType = "actors" | "groups" | "media" | "keywords";

interface FetchEventsRelationsOptions {
  /** Filter which relations to fetch. If not provided, fetches all relations. */
  relations?: RelationType[];
}

export const fetchEventsRelations =
  <C extends DatabaseContext & LoggerContext & ENVContext<ENV>>(
    events: readonly Events.Event[],
    isAdmin: boolean,
    options: FetchEventsRelationsOptions = {},
  ): TEReader<Events.EventRelations, C> =>
  (ctx) => {
    const { relations: relationsFilter } = options;
    const shouldFetch = (type: RelationType): boolean =>
      !relationsFilter || relationsFilter.includes(type);

    return pipe(
      TE.right(takeEventRelations(events)),
      TE.chain((relations) =>
        pipe(
          fetchRelations(
            {
              keywords: shouldFetch("keywords")
                ? pipe(relations.keywords, O.fromNullable, O.filter(isNonEmpty))
                : O.none(),
              actors: shouldFetch("actors")
                ? pipe(relations.actors, O.fromNullable, O.filter(isNonEmpty))
                : O.none(),
              groups: shouldFetch("groups")
                ? pipe(relations.groups, O.fromNullable, O.filter(isNonEmpty))
                : O.none(),
              groupsMembers: shouldFetch("groups")
                ? O.some(relations.groupsMembers)
                : O.none(),
              links: O.some(relations.links),
              media: shouldFetch("media")
                ? pipe(relations.media, O.fromNullable, O.filter(isNonEmpty))
                : O.none(),
            },
            isAdmin,
          )(ctx),
          TE.chain((fetchedRelations) =>
            sequenceS(TE.ApplicativePar)({
              events: fp.TE.right(events),
              actors: shouldFetch("actors")
                ? pipe(
                    ActorIO.decodeMany(fetchedRelations.actors),
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              groups: shouldFetch("groups")
                ? pipe(
                    fetchedRelations.groups.map((g) => ({ ...g, members: [] })),
                    (gg) => GroupIO.decodeMany(gg),
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              keywords: shouldFetch("keywords")
                ? pipe(
                    fetchedRelations.keywords,
                    KeywordIO.decodeMany,
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              media: shouldFetch("media")
                ? pipe(
                    fetchedRelations.media.map((m) => ({
                      ...m,
                      links: [],
                      keywords: [],
                    })),
                    (mm) => MediaIO.decodeMany(mm),
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              links: pipe(
                LinkIO.decodeMany(fetchedRelations.links),
                TE.fromEither,
              ),
              groupsMembers: shouldFetch("groups")
                ? pipe(relations.groupsMembers ?? [], (ids) =>
                    ids.length > 0
                      ? pipe(
                          ctx.db.find(GroupMemberEntity, {
                            where: { id: In(ids) },
                            relations: ["actor", "group"],
                          }),
                          TE.chain((entities) =>
                            pipe(
                              GroupMemberIO.decodeMany(entities),
                              TE.fromEither,
                            ),
                          ),
                        )
                      : TE.right([]),
                  )
                : TE.right([]),
              areas: TE.right([]),
            }),
          ),
        ),
      ),
    );
  };
