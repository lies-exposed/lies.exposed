import {
  EventsNetworkGraph,
  EventsNetworkGraphProps
} from "@liexp/ui/components/Graph/EventsNetworkGraph";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Box } from "@material-ui/core";
import * as React from "react";

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
  filter: any;
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
          ...(eventsFilter as any),
        }),
      }}
      render={({ events: { events, actors, groups, keywords } }) => {
        return (
          <Box
            style={{
              width: 1000,
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
