import {
  Events,
  Keyword,
  GroupMember,
  Actor,
  Group,
} from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import EventsTimeline from "@econnessione/ui/components/lists/EventList/EventTimeline";
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
import { eventsPaginated, InfiniteEventListParams } from "../state/queries";
import { doUpdateCurrentView } from "../utils/location.utils";
import { formatDate } from "@econnessione/shared/utils/date";

const eventsSort = pipe(
  Ord.reverse(D.Ord),
  Ord.contramap((e: Events.Event): Date => {
    if (e.type === Events.ScientificStudy.ScientificStudyType.value) {
      return e.date;
    }
    if (e.type === Events.Death.DeathType.value) {
      return e.date;
    }
    return e.date;
  })
);

export interface EventListProps {
  hash: string;
  filters: Omit<InfiniteEventListParams, "page" | "hash">;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
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
    if (isLoading && props.loadedElements < props.totalElements) {
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

const InfiniteEventList: React.FC<EventListProps> = ({
  hash,
  filters,
  ...onClickProps
}) => {
  const theme = useTheme();
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

  return (
    <Box>
      <WithQueries
        queries={{
          eventsPaginated,
        }}
        params={{
          eventsPaginated: {
            ...filters,
            page: state.currentPage,
            hash,
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ eventsPaginated: events }) => {
            const allEvents = pipe(
              state.filters.events ? events.data : [],
              A.sort(eventsSort)
            );

            const totalEvents =
              events.totals.uncategorized +
              events.totals.deaths +
              events.totals.scientificStudies;

            return (
              <Box style={{ width: "100%" }}>
                <Grid container>
                  <Grid container alignItems="center">
                    <Grid item md={6} sm={6} style={{ marginBottom: 40 }}>
                      <Typography variant="caption" display="inline">
                        Nº Events:{" "}
                        <Typography display="inline" variant="subtitle1" color="primary">
                          {totalEvents}
                        </Typography>{" "}
                        dal{" "}
                        {filters.startDate ? (
                          <Typography display="inline" variant="subtitle1" color="secondary">
                            {formatDate(new Date(filters.startDate))}
                          </Typography>
                        ) : null}
                        {" "}al{" "}
                        {filters.endDate ? (
                          <Typography display="inline" variant="subtitle1" color="secondary">
                            {formatDate(new Date(filters.endDate))}
                          </Typography>
                        ) : null}
                      </Typography>
                    </Grid>
                    <Grid
                      container
                      justifyContent="flex-end"
                      alignContent="flex-end"
                      style={{
                        marginBottom: theme.spacing(2),
                      }}
                    >
                      <Chip
                        label={`Events (${events.totals.uncategorized})`}
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
                        label={`Deaths (${events.totals.deaths})`}
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
                        label={`Science (${events.totals.scientificStudies})`}
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
                    actors: Queries.Actor.getList,
                    groups: Queries.Group.getList,
                    groupsMembers: Queries.GroupMember.getList,
                    keywords: Queries.Keyword.getList,
                    media: Queries.Media.getList,
                  }}
                  params={{
                    actors: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.actors.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: [...events.metadata.actors],
                      },
                    },
                    groups: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.groups.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.groups,
                      },
                    },
                    groupsMembers: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.groupsMembers.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.groupsMembers,
                      },
                    },
                    keywords: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.keywords.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.keywords,
                      },
                    },
                    media: {
                      pagination: {
                        page: 1,
                        perPage: events.metadata.media.length,
                      },
                      sort: { field: "createdAt", order: "DESC" },
                      filter: {
                        ids: events.metadata.media,
                      },
                    },
                  }}
                  render={QR.fold(
                    LazyFullSizeLoader,
                    ErrorBox,
                    ({ actors, groups, keywords, groupsMembers, media }) => {
                      return (
                        <Box width="100%">
                          <EventsTimeline
                            className="events"
                            style={{ width: "100%" }}
                            events={allEvents}
                            actors={actors.data}
                            groups={groups.data}
                            groupsMembers={groupsMembers.data}
                            keywords={keywords.data}
                            media={media.data}
                            onClick={(e) => {
                              if (e.type === "Death") {
                                void doUpdateCurrentView({
                                  view: "actor",
                                  actorId: e.payload.victim,
                                })();
                              } else if (e.type === "Uncategorized") {
                                void doUpdateCurrentView({
                                  view: "event",
                                  eventId: e.id,
                                })();
                              }
                            }}
                            {...onClickProps}
                          />
                        </Box>
                      );
                    }
                  )}
                />
                <BottomReach
                  currentPage={state.currentPage}
                  loadedElements={allEvents.length}
                  totalElements={totalEvents}
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
