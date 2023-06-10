import { fp } from "@liexp/core/lib/fp";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event";
import {
  type Keyword,
  type Media,
  type Actor,
  type Events,
  type Group,
} from "@liexp/shared/lib/io/http";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { EVENTS } from '@liexp/shared/lib/io/http/Events';
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
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

export const fetchEventsWithRelations: TEFlow<
  [NetworkType, UUID, GetNetworkQuery],
  {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }
> =
  (ctx) =>
  (type, id, { ids, relations }) => {
    return pipe(
      walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          searchEventV2Query(ctx)({
            ids: type === EVENTS.value ? O.some([id]) : O.none,
            actors: type === ACTORS.value ? O.some([id]) : O.none,
            groups: type === GROUPS.value ? O.some([id]) : O.none,
            keywords: type === KEYWORDS.value ? O.some([id]) : O.none,
            startDate: O.none,
            endDate: O.none,
            skip,
            take: amount,
            order: { date: "DESC" },
          }),
        (r) => r.total,
        (r) => r.results,
        0,
        50
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
                  O.fromPredicate((a) => a.length > 0)
                ),
                actors: pipe(
                  relations.actors,
                  O.fromPredicate((a) => a.length > 0)
                ),
                groups: pipe(
                  relations.groups,
                  O.fromPredicate((g) => g.length > 0)
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
                  toImageIO({ ...m, links: [], keywords: [], events: [] })
                ),
                fp.TE.fromEither
              ),
            })
          )
        );
      })
    );
  };
