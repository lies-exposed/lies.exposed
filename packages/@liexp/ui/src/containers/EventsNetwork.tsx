import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import * as React from "react";
import {
  EventsSankeyGraph,
  type EventsSankeyGraphProps,
} from "../components/Graph/EventsSankeyGraph.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Box } from "../components/mui/index.js";
import { useAPI } from "../hooks/useAPI.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { searchEventsQuery } from "../state/queries/SearchEventsQuery.js";
import { type EventsQueryParams } from "./EventsPanel.js";

interface EventsNetworkProps
  extends Omit<
    EventsSankeyGraphProps,
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
  const api = useAPI();

  const { Queries } = useEndpointQueries();

  const eventsFilter = {
    ...filter,
    _start: 0,
    _end: 100,
  };

  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery(api)({
          hash: "events-network",
          ...eventsFilter,
        }),
      }}
      render={({ events: { events, actors, groups, keywords } }) => {
        // console.log(events);

        const relationIds = events.reduce(
          (acc, e) => {
            const { actors, groups, groupsMembers } =
              getSearchEventRelations(e);
            return {
              actors: acc.actors.concat(
                actors
                  .filter((a) => !acc.actors.some((aa) => aa === a.id))
                  .map((a) => a.id),
              ),
              groups: acc.groups.concat(
                groups
                  .filter((a) => !acc.groups.some((aa) => aa === a.id))
                  .map((a) => a.id),
              ),
              groupsMembers: acc.groupsMembers.concat(
                groupsMembers
                  .filter((a) => !acc.groupsMembers.some((aa) => aa === a.id))
                  .map((a) => a.id),
              ),
            };
          },
          {
            actors: [] as any[],
            groups: [] as any[],
            groupsMembers: [] as any[],
          },
        );

        // console.log("relation ids", relationIds);

        return (
          <Box
            style={{
              display: "flex",
              width: "100%",
              padding: 40,
            }}
          >
            <QueriesRenderer
              queries={{
                actors: Queries.Actor.list.useQuery(
                  {
                    filter: { ids: relationIds.actors },
                  },
                  undefined,
                  true,
                ),
                groups: Queries.Group.list.useQuery(
                  {
                    filter: { ids: relationIds.groups },
                  },
                  undefined,
                  true,
                ),
              }}
              render={({ actors: { data: actors } }) => {
                return (
                  <EventsSankeyGraph
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
              }}
            />
          </Box>
        );
      }}
    />
  );
};
