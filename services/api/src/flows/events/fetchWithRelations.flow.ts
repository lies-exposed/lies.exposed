import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import {
  type SearchEventOutput,
  searchEventV2Query,
} from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type SearchEventsQuery } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchEventsRelations } from "./fetchEventsRelations.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

export const fetchEventsWithRelations =
  (
    {
      startDate,
      endDate,
      ...rest
    }: Partial<SearchEventsQuery.GetSearchEventsQuery>,
    isAdmin: boolean,
  ): TEReader<{
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }> =>
  (ctx) => {
    return pipe(
      walkPaginatedRequest<SearchEventOutput, ControllerError, Event>(
        ({ skip, amount }) =>
          searchEventV2Query({
            ...rest,
            withDeleted: isAdmin,
            withDrafts: isAdmin,
            startDate: pipe(startDate ?? O.none()),
            endDate: pipe(endDate ?? O.none()),
            skip,
            take: amount,
            order: { date: "DESC" },
          })(ctx),
        (r) => r.total,
        (r) => pipe(EventV2IO.decodeMany(r.results), TE.fromEither),
        0,
        10,
      )(ctx),
      TE.chain((events) => fetchEventsRelations(events, isAdmin)(ctx)),
    );
  };
