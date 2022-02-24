import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { searchEventsQuery } from "@econnessione/ui/state/queries/SearchEventsQuery";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { InfiniteEventListParams } from "../state/queries";

interface EventsNetworkProps
  extends Omit<
    EventsNetworkGraphProps,
    | "events"
    | "actors"
    | "groups"
    | "groupsMembers"
    | "keywords"
    | "selectedActorIds"
    | "selectedGroupIds"
    | "selectedKeywordIds"
  > {
  filter: Omit<InfiniteEventListParams, "page">;
}

export const EventsNetwork: React.FC<EventsNetworkProps> = ({
  filter,
  ...props
}) => {
  const eventsFilter = {
    ...filter,
    _start: 0,
    _end: 100,
  };

  return (
    <WithQueries
      queries={{ events: searchEventsQuery }}
      params={{
        events: {
          hash: "events-network",
          ...(eventsFilter as any),
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ events: { events, actors, groups, keywords } }) => {
          return (
            <EventsNetworkGraph
              {...props}
              events={events}
              actors={actors}
              groups={groups}
              keywords={keywords}
              selectedActorIds={filter.actors ?? []}
              selectedGroupIds={filter.groups ?? []}
              selectedKeywordIds={filter.keywords ?? []}
            />
          );
        }
      )}
    />
  );
};
