import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fetchRelations } from "@liexp/backend/lib/queries/common/fetchRelations.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event.js";
import {
  type GroupMember,
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
  type Link,
} from "@liexp/shared/lib/io/http/index.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import * as O from "effect/Option";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";

export type RelationType = "actors" | "groups" | "media" | "keywords";

interface FetchEventsRelationsOptions {
  /** Filter which relations to fetch. If not provided, fetches all relations. */
  relations?: RelationType[];
}

export const fetchEventsRelations =
  (
    events: readonly Events.Event[],
    isAdmin: boolean,
    options: FetchEventsRelationsOptions = {},
  ): TEReader<{
    events: readonly Events.Event[];
    actors: readonly Actor.Actor[];
    groups: readonly Group.Group[];
    keywords: readonly Keyword.Keyword[];
    media: readonly Media.Media[];
    links: readonly Link.Link[];
    groupsMembers: readonly GroupMember.GroupMember[];
  }> =>
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
          TE.chain((relations) =>
            sequenceS(TE.ApplicativePar)({
              events: fp.TE.right(events),
              actors: shouldFetch("actors")
                ? pipe(ActorIO.decodeMany(relations.actors), fp.TE.fromEither)
                : fp.TE.right([]),
              groups: shouldFetch("groups")
                ? pipe(
                    relations.groups.map((g) => ({ ...g, members: [] })),
                    (gg) => GroupIO.decodeMany(gg),
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              keywords: shouldFetch("keywords")
                ? pipe(
                    relations.keywords,
                    KeywordIO.decodeMany,
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              media: shouldFetch("media")
                ? pipe(
                    relations.media.map((m) => ({
                      ...m,
                      links: [],
                      keywords: [],
                    })),
                    (mm) => MediaIO.decodeMany(mm),
                    fp.TE.fromEither,
                  )
                : fp.TE.right([]),
              links: pipe(LinkIO.decodeMany(relations.links), TE.fromEither),
              groupsMembers: TE.right([]),
            }),
          ),
        ),
      ),
    );
  };
