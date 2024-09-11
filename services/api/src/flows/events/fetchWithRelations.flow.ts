import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
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
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "#routes/events/queries/searchEventsV2.query.js";

export const fetchEventsWithRelations: TEFlow<
  [NetworkType, UUID[], GetNetworkQuery, boolean],
  {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }
> =
  (ctx) =>
  (type, ids, { actors, groups, keywords, startDate, endDate }, isAdmin) => {
    ctx.logger.debug.log(`Fetch all events with %O`, {
      actors,
      groups,
      keywords,
      startDate,
      endDate,
    });
    return pipe(
      walkPaginatedRequest(ctx)<
        SearchEventOutput,
        ControllerError,
        EventV2Entity
      >(
        ({ skip, amount }) =>
          searchEventV2Query(ctx)({
            ids: fp.O.none,
            actors,
            groups,
            keywords,
            startDate: pipe(startDate, fp.O.map(parseISO)),
            endDate: pipe(endDate, fp.O.map(parseISO)),
            skip,
            take: amount,
            order: { date: "DESC" },
          }),
        (r) => r.total,
        (r) => r.results,
        0,
        100,
      ),
      TE.chainEitherK(EventV2IO.decodeMany),
      TE.chain((events) => fetchEventsRelations(ctx)(events, isAdmin)),
    );
  };
