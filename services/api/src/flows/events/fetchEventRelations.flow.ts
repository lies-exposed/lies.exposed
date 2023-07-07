import { fp } from "@liexp/core/lib/fp";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event";
import {
    type Actor,
    type Events,
    type Group,
    type Keyword,
    type Media,
} from "@liexp/shared/lib/io/http";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { type TEFlow } from "@flows/flow.types";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { fetchRelations } from "@routes/events/queries/fetchEventRelations.utils";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { toGroupIO } from "@routes/groups/group.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toImageIO } from "@routes/media/media.io";

interface FetchEventsRelationsParam {
  actors: UUID[];
  groups: UUID[];
  keywords: UUID[];
}

export const fetchEventsRelations: TEFlow<
  [FetchEventsRelationsParam],
  {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }
> =
  (ctx) =>
  ({ actors, groups, keywords }) => {
    return pipe(
      walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          searchEventV2Query(ctx)({
            ids: O.none,
            actors: pipe(actors, O.fromPredicate(fp.A.isNonEmpty)),
            groups: pipe(groups, O.fromPredicate(fp.A.isNonEmpty)),
            keywords: pipe(keywords, O.fromPredicate(fp.A.isNonEmpty)),
            startDate: O.none,
            endDate: O.none,
            skip,
            take: amount,
            order: { date: "DESC" },
          }),
        (r) => r.total,
        (r) => r.results,
        0,
        100
      ),
      TE.chain((results) => {
        ctx.logger.debug.log("Events found %d", results.length);

        return pipe(
          results,
          fp.A.traverse(fp.E.Applicative)(toEventV2IO),
          fp.TE.fromEither,
          fp.TE.map((events) => ({
            ...takeEventRelations(events),
            events,
          })),
          fp.TE.chain(({ events, ...relations }) =>
            pipe(
              fetchRelations(ctx)({
                keywords: pipe(
                  relations.keywords,
                  O.fromPredicate(fp.A.isNonEmpty)
                ),
                actors: pipe(
                  relations.actors,
                  O.fromPredicate(fp.A.isNonEmpty)
                ),
                groups: pipe(
                  relations.groups,
                  O.fromPredicate(fp.A.isNonEmpty)
                ),
                groupsMembers: O.some(relations.groupsMembers),
                links: O.none,
                media: pipe(
                  relations.media,
                  O.fromPredicate((m) => m.length > 0)
                ),
              }),
              TE.map((relations) => ({ ...relations, events }))
            )
          ),
          TE.chain(({ events, ...relations }) =>
            sequenceS(TE.ApplicativePar)({
              events: fp.TE.right(events),
              actors: pipe(
                relations.actors,
                fp.A.traverse(fp.E.Applicative)(toActorIO),
                fp.TE.fromEither
              ),
              groups: pipe(
                relations.groups,
                fp.A.traverse(fp.E.Applicative)((g) =>
                  toGroupIO({ ...g, members: [] })
                ),
                fp.TE.fromEither
              ),
              keywords: pipe(
                relations.keywords,
                fp.A.traverse(fp.E.Applicative)(toKeywordIO),
                fp.TE.fromEither
              ),
              media: pipe(
                relations.media,
                fp.A.traverse(fp.E.Applicative)((m) =>
                  toImageIO(
                    { ...m, links: [], keywords: [], events: [] },
                    ctx.env.SPACE_ENDPOINT
                  )
                ),
                fp.TE.fromEither
              ),
            })
          )
        );
      })
    );
  };
