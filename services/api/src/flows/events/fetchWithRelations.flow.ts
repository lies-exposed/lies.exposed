import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchEventsRelations } from "./fetchEventsRelations.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "#routes/events/queries/searchEventsV2.query.js";

export const fetchEventsWithRelations =
  (
    type: NetworkType,
    ids: UUID[],
    { actors, groups, keywords, startDate, endDate }: GetNetworkQuery,
    isAdmin: boolean,
  ): TEReader<{
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }> =>
  (ctx) => {
    ctx.logger.debug.log(`Fetch all events with %O`, {
      actors,
      groups,
      keywords,
      startDate,
      endDate,
    });
    return pipe(
      walkPaginatedRequest<SearchEventOutput, ControllerError, Event>(
        ({ skip, amount }) =>
          searchEventV2Query({
            ids: fp.O.none,
            actors,
            groups,
            keywords,
            startDate: pipe(startDate, fp.O.map(parseISO)),
            endDate: pipe(endDate, fp.O.map(parseISO)),
            skip,
            take: amount,
            order: { date: "DESC" },
          })(ctx),
        (r) => r.total,
        (r) => pipe(EventV2IO.decodeMany(r.results), TE.fromEither),
        0,
        100,
      )(ctx),
      TE.chain((events) => fetchEventsRelations(events, isAdmin)(ctx)),
    );
  };
