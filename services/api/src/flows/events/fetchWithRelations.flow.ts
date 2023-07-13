import { fp } from "@liexp/core/lib/fp";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event";
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
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { fetchEventsRelations } from "./fetchEventRelations.flow";
import { type TEFlow } from "@flows/flow.types";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";

export const fetchEventsWithRelations: TEFlow<
  [NetworkType, UUID[], GetNetworkQuery],
  {
    events: Events.Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
    media: Media.Media[];
  }
> =
  (ctx) =>
  (type, ids, { actors, groups, keywords }) => {
    return pipe(
      searchEventV2Query(ctx)({
        actors,
        groups,
        keywords,
        ids: fp.O.none,
        startDate: fp.O.none,
        endDate: fp.O.none,
        order: { date: "DESC" },
      }),
      TE.chainEitherK(({ results }) =>
        pipe(results.map(toEventV2IO), fp.A.sequence(fp.E.Applicative)),
      ),
      TE.map(takeEventRelations),
      TE.chain((events) => fetchEventsRelations(ctx)(events)),
    );
  };
