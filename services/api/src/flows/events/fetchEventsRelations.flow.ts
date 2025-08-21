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

export const fetchEventsRelations =
  (
    events: readonly Events.Event[],
    isAdmin: boolean,
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
    return pipe(
      TE.right(takeEventRelations(events)),
      TE.chain((relations) =>
        pipe(
          fetchRelations(
            {
              keywords: pipe(
                relations.keywords,
                O.fromNullable,
                O.filter(isNonEmpty),
              ),
              actors: pipe(
                relations.actors,
                O.fromNullable,
                O.filter(isNonEmpty),
              ),
              groups: pipe(
                relations.groups,
                O.fromNullable,
                O.filter(isNonEmpty),
              ),
              groupsMembers: O.some(relations.groupsMembers),
              links: O.some(relations.links),
              media: pipe(
                relations.media,
                O.fromNullable,
                O.filter(isNonEmpty),
              ),
            },
            isAdmin,
          )(ctx),
          TE.chain((relations) =>
            sequenceS(TE.ApplicativePar)({
              events: fp.TE.right(events),
              actors: pipe(
                ActorIO.decodeMany(relations.actors),
                fp.TE.fromEither,
              ),
              groups: pipe(
                relations.groups.map((g) => ({ ...g, members: [] })),
                (gg) => GroupIO.decodeMany(gg),
                fp.TE.fromEither,
              ),
              keywords: pipe(
                relations.keywords,
                KeywordIO.decodeMany,
                fp.TE.fromEither,
              ),
              media: pipe(
                relations.media.map((m) => ({ ...m, links: [], keywords: [] })),
                (mm) => MediaIO.decodeMany(mm),
                fp.TE.fromEither,
              ),
              links: pipe(LinkIO.decodeMany(relations.links), TE.fromEither),
              groupsMembers: TE.right([]),
            }),
          ),
        ),
      ),
    );
  };
