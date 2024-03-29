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
import { type TEFlow } from "#flows/flow.types.js";
import { toActorIO } from "#routes/actors/actor.io.js";
import { fetchRelations } from "#routes/events/queries/fetchEventRelations.query.js";
import { toGroupIO } from "#routes/groups/group.io.js";
import { toKeywordIO } from "#routes/keywords/keyword.io.js";
import { toMediaIO } from "#routes/media/media.io.js";

export const fetchEventsRelations: TEFlow<
  [Events.Event[], boolean],
  {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
    groupsMembers: GroupMember.GroupMember[];
  }
> = (ctx) => (events, isAdmin) => {
  return pipe(
    TE.right(takeEventRelations(events)),
    TE.chain((relations) =>
      pipe(
        fetchRelations(ctx)(
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
        ),
        TE.chain((relations) =>
          sequenceS(TE.ApplicativePar)({
            events: fp.TE.right(events),
            actors: pipe(
              relations.actors,
              fp.A.traverse(fp.E.Applicative)(toActorIO),
              fp.TE.fromEither,
            ),
            groups: pipe(
              relations.groups,
              fp.A.traverse(fp.E.Applicative)((g) =>
                toGroupIO({ ...g, members: [] }),
              ),
              fp.TE.fromEither,
            ),
            keywords: pipe(
              relations.keywords,
              fp.A.traverse(fp.E.Applicative)(toKeywordIO),
              fp.TE.fromEither,
            ),
            media: pipe(
              relations.media,
              fp.A.traverse(fp.E.Applicative)((m) =>
                toMediaIO(
                  { ...m, links: [], keywords: [], events: [] },
                  ctx.env.SPACE_ENDPOINT,
                ),
              ),
              fp.TE.fromEither,
            ),
            groupsMembers: TE.right([]),
          }),
        ),
      ),
    ),
  );
};
