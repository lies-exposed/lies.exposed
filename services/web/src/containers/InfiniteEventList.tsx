import { Events } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { debounce } from "throttle-debounce";
import {
  deathsPaginated,
  eventsPaginated,
  InfiniteEventListParams,
  scientificStudiesPaginated,
} from "../state/queries";
import { doUpdateCurrentView } from "../utils/location.utils";

const eventsSort = pipe(
  Ord.reverse(D.Ord),
  Ord.contramap((e: Events.Event): Date => {
    if (e.type === Events.ScientificStudy.ScientificStudyType.value) {
      return e.publishDate;
    }
    if (e.type === Events.Death.DeathType.value) {
      return e.date;
    }
    return e.startDate;
  })
);

export interface EventListProps {
  filters: Omit<InfiniteEventListParams, "page">;
  onClick?: (e: Events.Event) => void;
}

interface BottomReachProps {
  currentPage: number;
  loadedElements: number;
  totalElements: number;
  onBottomReach: () => void;
}

// eslint-disable-next-line react/display-name
const BottomReach: React.FC<BottomReachProps> = (props) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleScroll = React.useCallback(
    debounce(300, false, async (): Promise<void> => {
      // console.log("scrolling", {isLoading, props});
      if (listRef.current && !isLoading) {
        const { scrollHeight, offsetTop } = listRef.current;

        const elBottom = scrollHeight + offsetTop;
        const windowBottom = window.scrollY + window.innerHeight;
        // console.log({
        //   elBottom,
        //   windowBottom,
        // });
        const deltaBottom = elBottom - windowBottom;

        const allLoaded = props.loadedElements === props.totalElements;

        // console.log({ deltaBottom, allLoaded });
        if (deltaBottom < 100 && !allLoaded) {
          // console.log({
          //   isLoading,
          //   allLoaded,
          //   total: events.total,
          //   dataLength: events.data.length,
          // });

          props.onBottomReach();
          setIsLoading(true);
        }
      }
    }),
    [props.currentPage]
  );

  React.useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    if (props.loadedElements < props.totalElements) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener("scroll", handleScroll);
    };
  }, [props.currentPage, props.loadedElements]);

  return (
    <div ref={listRef} style={{ width: 300, height: 100, margin: "auto" }}>
      {isLoading ? <CircularProgress /> : null}
    </div>
  );
};

const InfiniteEventList: React.FC<EventListProps> = ({ filters, onClick }) => {
  const [state, updateState] = React.useState<{
    currentPage: number;
    filters: {
      death: boolean;
      events: boolean;
      scientificStudies: boolean;
    };
  }>({
    currentPage: 1,
    filters: {
      death: true,
      events: true,
      scientificStudies: true,
    },
  });

  // const infiniteEventListQuery = React.useMemo(
  //   () => infiniteEventList,
  //   [eventFilters.hash]
  // );

  const theme = useTheme();

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
  }, [filters.hash]);

  return (
    <Box>
      <WithQueries
        queries={{
          eventsPaginated,
          deathsPaginated,
          scientificStudiesPaginated,
        }}
        params={{
          eventsPaginated: {
            ...filters,
            page: state.currentPage,
          },
          deathsPaginated: {
            minDate: filters.startDate,
            maxDate: filters.endDate,
            victim: filters.actors,
            page: state.currentPage,
          },
          scientificStudiesPaginated: {
            publisher: filters.groups,
            page: state.currentPage,
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({
            eventsPaginated: events,
            deathsPaginated: deaths,
            scientificStudiesPaginated: scientificStudies,
          }) => {
            const allEvents = pipe(
              [
                ...(state.filters.events ? events.data : []),
                ...(state.filters.death ? deaths.data : []),
                ...(state.filters.death ? scientificStudies.data : []),
              ],
              A.sort(eventsSort)
            );

            return (
              <Box style={{ width: "100%" }}>
                <Grid container>
                  <Grid container alignItems="center">
                    <Grid item md={6} style={{ marginBottom: 40 }}>
                      <Typography variant="caption" display="inline">
                        Nº Events:{" "}
                        <Typography display="inline" variant="subtitle1">
                          {events.total + deaths.total}
                        </Typography>{" "}
                        dal{" "}
                        <Typography display="inline" variant="subtitle1">
                          {filters.startDate}
                        </Typography>{" "}
                        al{" "}
                        <Typography display="inline" variant="subtitle1">
                          {filters.endDate}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid
                      container
                      lg={6}
                      md={12}
                      sm={12}
                      justifyContent="flex-end"
                      alignContent="flex-end"
                    >
                      <Chip
                        label={`Events (${events.total})`}
                        color="primary"
                        variant={state.filters.events ? "default" : "outlined"}
                        style={{ marginRight: 10 }}
                        onClick={() => {
                          updateState({
                            ...state,
                            filters: {
                              ...state.filters,
                              events: !state.filters.events,
                            },
                          });
                        }}
                      />
                      <Chip
                        label={`Deaths (${deaths.total})`}
                        color={"secondary"}
                        variant={state.filters.death ? "default" : "outlined"}
                        style={{ marginRight: 10 }}
                        onClick={() => {
                          updateState({
                            ...state,
                            filters: {
                              ...state.filters,
                              death: !state.filters.death,
                            },
                          });
                        }}
                      />
                      <Chip
                        label={`Science (${scientificStudies.total})`}
                        color={"secondary"}
                        variant={
                          state.filters.scientificStudies
                            ? "default"
                            : "outlined"
                        }
                        onClick={() => {
                          updateState({
                            ...state,
                            filters: {
                              ...state.filters,
                              scientificStudies:
                                !state.filters.scientificStudies,
                            },
                          });
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <WithQueries
                  queries={{
                    eventActors: Queries.Actor.getList,
                    eventGroups: Queries.Group.getList,
                    eventGroupMembers: Queries.GroupMember.getList,
                    eventKeywords: Queries.Keyword.getList,
                  }}
                  params={{
                    eventActors: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.actors.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: [
                          ...events.metadata.actors,
                          ...deaths.metadata.victims,
                        ],
                      },
                    },
                    eventGroups: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.groups.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.groups,
                      },
                    },
                    eventGroupMembers: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.groupsMembers.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.groupsMembers,
                      },
                    },
                    eventKeywords: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.keywords.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.keywords,
                      },
                    },
                  }}
                  render={QR.fold(
                    LazyFullSizeLoader,
                    ErrorBox,
                    ({
                      eventActors: actors,
                      eventGroups: groups,
                      eventKeywords: keywords,
                      eventGroupMembers: groupsMembers,
                    }) => {
                      return (
                        <Box>
                          <EventList
                            className="events"
                            style={{ width: "100%" }}
                            actors={actors.data}
                            groups={groups.data}
                            groupsMembers={groupsMembers.data}
                            events={allEvents}
                            keywords={keywords.data}
                            onClick={(e) => {
                              void doUpdateCurrentView({
                                view: "event",
                                eventId: e.id,
                              })();
                            }}
                          />
                        </Box>
                      );
                    }
                  )}
                />
                <BottomReach
                  currentPage={state.currentPage}
                  loadedElements={allEvents.length}
                  totalElements={events.total + deaths.total}
                  onBottomReach={() => handleBottomReached()}
                />
              </Box>
            );
          }
        )}
      />
    </Box>
  );
};

export default React.memo(InfiniteEventList, (prevProps, nextProps) => {
  const prevPropsJ = JSON.stringify(prevProps);
  const nextPropsJ = JSON.stringify(nextProps);
  return prevPropsJ === nextPropsJ;
});
