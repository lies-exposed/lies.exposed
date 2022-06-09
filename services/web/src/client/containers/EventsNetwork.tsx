import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@liexp/ui/components/Graph/EventsNetworkGraph";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { Box } from "@liexp/ui/components/mui";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import * as React from "react";
import { EventsQueryParams } from "./EventsPanel";

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
  filter: Omit<EventsQueryParams, "tab">;
}

export const EventsNetwork: React.FC<EventsNetworkProps> = ({
  filter,
  ...props
}) => {
  // console.log(filter);

  const eventsFilter = {
    ...filter,
    _start: 0,
    _end: 100,
  };

  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: "events-network",
          ...eventsFilter,
        }),
      }}
      render={({ events: { events, actors, groups, keywords } }) => {
        // console.log({ events, actors, groups, keywords });

        return (
          <Box
            style={{
              display: "flex",
              width: "100%",
              padding: 40,
            }}
          >
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
          </Box>
        );
      }}
    />
  );
};
