import { fp } from "@liexp/core/lib/fp";
import {
  type Actor,
  type Events,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import {
  type GetNetworkQuery,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { parseISO } from "@liexp/shared/lib/utils/date";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { fetchEventsRelations } from "./fetchEventsRelations.flow";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type TEFlow } from "@flows/flow.types";
import { type ControllerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import {
  searchEventV2Query,
  type SearchEventOutput,
} from "@routes/events/queries/searchEventsV2.query";

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
      TE.chainEitherK(
        flow(fp.A.map(toEventV2IO), fp.A.sequence(fp.E.Applicative)),
      ),
      TE.chain((events) => fetchEventsRelations(ctx)(events, isAdmin)),
    );
  };
