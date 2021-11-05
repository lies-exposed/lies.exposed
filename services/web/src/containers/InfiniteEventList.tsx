import { Endpoints } from "@econnessione/shared/endpoints";
import { Events } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import {
  FullSizeLoader,
  LazyFullSizeLoader,
} from "@econnessione/ui/components/Common/FullSizeLoader";
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
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { debounce } from "throttle-debounce";
import { serializedType } from "ts-io-error/lib/Codec";
import {
  actorsInfiniteList,
  deathsInfiniteList,
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
  eventFilters: Omit<InfiniteEventListParams, "page">;
  deathFilters: QueryFilters<typeof Endpoints.DeathEvent.List.Input.Query>;
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
  eventFilters,
  deathFilters,
  onClick,
}) => {
  const [state, updateState] = React.useState<{
    loading: boolean;
    currentPage: number;
  }>({
    loading: false,
    currentPage: 1,
  });

  // const infiniteEventListQuery = React.useMemo(
  //   () => infiniteEventList,
  //   [eventFilters.hash]
  // );

  // const deathsInfiniteListQuery = React.useMemo(
  //   () => deathsInfiniteList,
  //   [deathFilters.hash]
  // );

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
          deaths: deathsInfiniteList,
        }}
        params={{
          events: {
            ...eventFilters,
            page: state.currentPage,
          },
          deaths: {
            ...deathFilters,
            page: state.currentPage,
          },
        }}
        render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events, deaths }) => {
          const allEvents = React.useMemo(
            () => pipe([...events.data, ...deaths.data], A.sort(eventsSort)),
            [events.data.length, deaths.data.length]
          );

          return (
            <Box style={{ width: "100%" }}>
              <Grid container>
                <Grid container alignItems="center">
                  <Typography variant="caption">
                    Nº Events:{" "}
                    <Typography display="inline" variant="subtitle1">
                      {events.total}
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
                <Grid container justifyContent="flex-end">
                  <Box margin={1}>
                    <Chip label={`Events (${events.total})`} />
                  </Box>
                  <Box margin={1}>
                    <Chip
                      label={`Deaths (${deaths.total})`}
                      style={{
                        backgroundColor: theme.palette.common.black,
                        color: theme.palette.common.white,
                      }}
                    />
                  </Box>
                </Grid>
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
