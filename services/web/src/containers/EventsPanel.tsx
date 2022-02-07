import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import EventsMap from "@econnessione/ui/components/EventsMap";
import {
  actorsDiscreteQuery,
  groupsDiscreteQuery,
  groupsMembersDiscreteQuery,
  keywordsDiscreteQuery,
} from "@econnessione/ui/state/queries/DiscreteQueries";
import { searchEventsQuery } from "@econnessione/ui/state/queries/SearchEventsQuery";
import { Box, Tab, Tabs } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import EventsFilter from "../components/events/EventsFilter";
import {
  CurrentView,
  doUpdateCurrentView,
  EventsView,
} from "../utils/location.utils";
import { EventsNetwork } from "./EventsNetwork";
import InfiniteEventList from "./InfiniteEventList";

interface EventsPanelProps {
  view: CurrentView;
  showFilters: boolean;
  filters: Required<Omit<EventsView, "view">>;
}
export const EventsPanel: React.FC<EventsPanelProps> = ({
  view,
  showFilters,
  filters: {
    tab = 0,
    hash,
    startDate,
    endDate,
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    keywords: keywordIds,
    ...filtersRest
  },
}) => {
  const queryFilters = {
    ...filtersRest,
    startDate,
    endDate,
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    keywords: keywordIds,
    hash,
    tab,
  };

  const [state, updateState] = React.useState<{
    currentPage: number;
    filters: {
      deaths: boolean;
      uncategorized: boolean;
      scientificStudies: boolean;
      patents: boolean;
    };
  }>({
    currentPage: 1,
    filters: {
      deaths: true,
      uncategorized: true,
      scientificStudies: true,
      patents: true,
    },
  });

  const handleBottomReached = React.useCallback((): void => {
    const nextPage = state.currentPage + 1;
    void updateState({
      ...state,
      currentPage: nextPage,
    });
  }, [state.currentPage]);

  React.useEffect(() => {
    if (state.currentPage > 1) {
      updateState((s) => ({
        ...s,
        currentPage: 1,
      }));
    }
  }, [hash]);

  const handleUpdateCurrentView = React.useCallback(
    (update: Partial<Omit<CurrentView, "view">>): void => {
      void doUpdateCurrentView({
        ...view,
        ...queryFilters,
        ...update,
      })();
    },
    [hash, tab, queryFilters]
  );

  const onActorsChange = React.useCallback(
    (actors: string[]): void => {
      handleUpdateCurrentView({
        actors,
      });
    },
    [queryFilters]
  );

  const onGroupsChange = React.useCallback(
    (groups: string[]): void => {
      handleUpdateCurrentView({
        groups,
      });
    },
    [queryFilters]
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateCurrentView({
        groupsMembers,
      });
    },
    [queryFilters]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: string[]): void => {
      handleUpdateCurrentView({
        keywords,
      });
    },
    [queryFilters]
  );

  return (
    <WithQueries
      queries={{
        filterActors: actorsDiscreteQuery,
        filterGroups: groupsDiscreteQuery,
        filterGroupsMembers: groupsMembersDiscreteQuery,
        filterKeywords: keywordsDiscreteQuery,
        searchEvents: searchEventsQuery,
      }}
      params={{
        filterActors: {
          pagination: { page: 1, perPage: actorIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: actorIds },
        },
        filterGroups: {
          pagination: { page: 1, perPage: groupIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupIds },
        },
        filterGroupsMembers: {
          pagination: { page: 1, perPage: groupsMembersIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupsMembersIds },
        },
        filterKeywords: {
          pagination: { page: 1, perPage: keywordIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: keywordIds },
        },
        searchEvents: {
          ...queryFilters,
          links: [],
          page: state.currentPage,
          hash,
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({
          filterActors,
          filterGroups,
          filterGroupsMembers,
          filterKeywords,
          searchEvents,
        }) => {
          return (
            <Box style={{ width: "100%" }}>
              <EventsFilter
                showFilters={showFilters}
                queryFilters={queryFilters}
                filters={state.filters}
                actors={filterActors.data}
                groups={filterGroups.data}
                groupsMembers={filterGroupsMembers.data}
                keywords={filterKeywords.data}
                totals={searchEvents.totals}
                onFilterChange={(f) =>
                  updateState({
                    ...state,
                    filters: f,
                  })
                }
                onQueryFilterChange={handleUpdateCurrentView}
              />

              <Tabs
                style={{ width: "100%", marginBottom: 30 }}
                value={tab}
                onChange={(e, tab) => handleUpdateCurrentView({ tab })}
              >
                <Tab label="list" {...a11yProps(0)} />
                <Tab label="map" {...a11yProps(1)} />
                <Tab label="network" {...a11yProps(2)} />
              </Tabs>

              <TabPanel value={tab} index={0}>
                {tab === 0 ? (
                  <InfiniteEventList
                    {...searchEvents}
                    hash={hash}
                    queryFilters={{ ...queryFilters, page: state.currentPage }}
                    filters={state.filters}
                    onBottomReached={handleBottomReached}
                    onGroupClick={(g) => {
                      onGroupsChange(
                        groupIds.includes(g.id)
                          ? groupIds.filter((aa) => g.id !== aa)
                          : groupIds.concat(g.id)
                      );
                    }}
                    onGroupMemberClick={(gm) => {
                      onGroupMembersChange(
                        groupsMembersIds.includes(gm.id)
                          ? groupsMembersIds.filter((aa) => gm.id !== aa)
                          : groupsMembersIds.concat(gm.id)
                      );
                    }}
                    onActorClick={(a) => {
                      onActorsChange(
                        actorIds.includes(a.id)
                          ? actorIds.filter((aa) => a.id !== aa)
                          : actorIds.concat(a.id)
                      );
                    }}
                    onKeywordClick={(k) => {
                      onKeywordsChange(
                        keywordIds.includes(k.id)
                          ? keywordIds.filter((aa) => k.id !== aa)
                          : keywordIds.concat(k.id)
                      );
                    }}
                  />
                ) : null}
              </TabPanel>
              <TabPanel value={tab} index={1}>
                {tab === 1 ? (
                  <EventsMap
                    filter={{
                      actors: [],
                      groups: [],
                    }}
                    onMapClick={() => {}}
                  />
                ) : null}
              </TabPanel>
              <TabPanel value={tab} index={2}>
                {tab === 2 ? (
                  <EventsNetwork
                    filter={queryFilters}
                    groupBy={"actor"}
                    scale={"all"}
                    scalePoint={O.none}
                    onEventClick={(e) => {
                      void doUpdateCurrentView({
                        view: "event",
                        eventId: e.id,
                      })();
                    }}
                  />
                ) : null}
                <div />
              </TabPanel>
            </Box>
          );
        }
      )}
    />
  );
};
