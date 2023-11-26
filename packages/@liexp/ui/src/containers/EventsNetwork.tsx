import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations";
import * as React from "react";
import {
  EventsSankeyGraph,
  type EventsSankeyGraphProps,
} from "../components/Graph/EventsSankeyGraph";
import QueriesRenderer from "../components/QueriesRenderer";
import { Box } from "../components/mui";
import { searchEventsQuery } from "../state/queries/SearchEventsQuery";
import { useActorsQuery } from "../state/queries/actor.queries";
import { useGroupsQuery } from "../state/queries/groups.queries";
import { type EventsQueryParams } from "./EventsPanel";

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
        // console.log(events);

        const relationIds = events.reduce(
          (acc, e) => {
            const { actors, groups, groupsMembers } = getSearchEventRelations(e);
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
                actors: useActorsQuery(
                  {
                    filter: { ids: relationIds.actors },
                  },
                  true,
                ),
                groups: useGroupsQuery(
                  {
                    filter: { ids: relationIds.groups },
                  },
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
