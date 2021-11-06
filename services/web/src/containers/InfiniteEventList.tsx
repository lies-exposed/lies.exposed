import { Events } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { Death } from "@io/http/Events";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@material-ui/core";
import { APIError } from "@providers/api.provider";
import { available, queryStrict } from "avenger";
import { CachedQuery } from "avenger/lib/Query";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { debounce } from "throttle-debounce";
import { serializedType } from "ts-io-error/lib/Codec";
import {
  deathsInfiniteList,
  InfiniteDeathsListParam,
  infiniteEventList,
  InfiniteEventListParams,
} from "../state/queries";
import { doUpdateCurrentView } from "../utils/location.utils";

const eventsSort = pipe(
  Ord.reverse(D.Ord),
  Ord.contramap((e: Events.Event): Date => {
    if (e.type === "Death") {
      return e.date;
    }
    return e.startDate;
  })
);

type QueryFilters<Q> = Omit<
  Partial<serializedType<Q>>,
  "_sort" | "_order" | "_end" | "_start"
> & { hash?: string };

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
      // console.log("scrolling", props.loading);
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

          // console.log("bottom! yeah ", currentPage + 1);
          setIsLoading(true);
          props.onBottomReach();
        }
      }
    }),
    [props.currentPage, isLoading]
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
  }, [props.currentPage, isLoading]);

  return (
    <div ref={listRef} style={{ width: "100%", height: 100 }}>
      {isLoading ? <CircularProgress /> : null}
    </div>
  );
};

const InfiniteEventList: React.FC<EventListProps> = ({
  filters: eventFilters,
  // deathFilters,
  onClick,
}) => {
  const [state, updateState] = React.useState<{
    loading: boolean;
    currentPage: number;
    filters: {
      death: boolean;
      events: boolean;
    };
  }>({
    loading: false,
    currentPage: 1,
    filters: {
      death: true,
      events: true,
    },
  });

  // const infiniteEventListQuery = React.useMemo(
  //   () => infiniteEventList,
  //   [eventFilters.hash]
  // );

  const deathsInfiniteListQuery: typeof deathsInfiniteList = React.useMemo(
    () =>
      eventFilters.actors?.length === 0
        ? queryStrict(
            () =>
              TE.right({
                data: [] as Death.Death[],
                total: 0,
                metadata: {
                  victims: [] as string[],
                },
              }),
            available
          )
        : deathsInfiniteList,
    [eventFilters.actors?.length]
  );

  const theme = useTheme();

  const handleBottomReached = (): void => {
    updateState((s) => ({
      ...s,
      loading: true,
      currentPage: s.currentPage + 1,
    }));
  };

  return (
    <Box>
      <WithQueries
        queries={{
          events: infiniteEventList,
          deaths: deathsInfiniteListQuery,
        }}
        params={{
          events: {
            ...eventFilters,
            page: state.currentPage,
          },
          deaths: {
            minDate: eventFilters.startDate,
            maxDate: eventFilters.endDate,
            victim: eventFilters.actors,
            page: state.currentPage,
          },
        }}
        render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events, deaths }) => {
          const allEvents = React.useMemo(
            () =>
              pipe(
                [
                  ...(state.filters.events ? events.data : []),
                  ...(state.filters.death ? deaths.data : []),
                ],
                A.sort(eventsSort)
              ),
            [events.data.length, deaths.data.length, state.filters]
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
                        {eventFilters.startDate}
                      </Typography>{" "}
                      al{" "}
                      <Typography display="inline" variant="subtitle1">
                        {eventFilters.endDate}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid
                    container
                    md={6}
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
                  </Grid>
                </Grid>
                <Grid container justifyContent="flex-end"></Grid>
              </Grid>

              <WithQueries
                queries={{
                  eventActors: Queries.Actor.getList,
                  eventGroups: Queries.Group.getList,
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
                  }) => {
                    return (
                      <Box>
                        <EventList
                          className="events"
                          style={{ width: "100%" }}
                          actors={actors.data}
                          groups={groups.data}
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
                {...state}
                loadedElements={allEvents.length}
                totalElements={events.total + deaths.total}
                onBottomReach={() => handleBottomReached()}
              />
            </Box>
          );
        })}
      />
    </Box>
  );
};

export default InfiniteEventList;
