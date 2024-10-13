import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event.js";
import {
  type GroupMember,
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";
import { ActorIO } from "#routes/actors/actor.io.js";
import { fetchRelations } from "#routes/events/queries/fetchEventRelations.query.js";
import { GroupIO } from "#routes/groups/group.io.js";
import { KeywordIO } from "#routes/keywords/keyword.io.js";
import { MediaIO } from "#routes/media/media.io.js";

export const fetchEventsRelations =
  (
    events: Events.Event[],
    isAdmin: boolean,
  ): TEReader<{
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
    groupsMembers: GroupMember.GroupMember[];
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
                O.fromPredicate(fp.A.isNonEmpty),
              ),
              actors: pipe(relations.actors, O.fromPredicate(fp.A.isNonEmpty)),
              groups: pipe(relations.groups, O.fromPredicate(fp.A.isNonEmpty)),
              groupsMembers: O.some(relations.groupsMembers),
              links: O.none,
              media: pipe(
                relations.media,
                O.fromPredicate((m) => m.length > 0),
              ),
            },
            isAdmin,
          )(ctx),
          TE.chain((relations) =>
            sequenceS(TE.ApplicativePar)({
              events: fp.TE.right(events),
              actors: pipe(
                ActorIO.decodeMany(relations.actors, ctx.env.SPACE_ENDPOINT),
                fp.TE.fromEither,
              ),
              groups: pipe(
                relations.groups.map((g) => ({ ...g, members: [] })),
                (gg) => GroupIO.decodeMany(gg, ctx.env.SPACE_ENDPOINT),
                fp.TE.fromEither,
              ),
              keywords: pipe(
                relations.keywords,
                KeywordIO.decodeMany,
                fp.TE.fromEither,
              ),
              media: pipe(
                relations.media.map((m) => ({ ...m, links: [], keywords: [] })),
                (mm) => MediaIO.decodeMany(mm, ctx.env.SPACE_ENDPOINT),
                fp.TE.fromEither,
              ),
              groupsMembers: TE.right([]),
            }),
          ),
        ),
      ),
    );
  };
