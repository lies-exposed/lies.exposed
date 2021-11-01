import { Endpoints } from "@econnessione/shared/endpoints";
import { Events } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { Box, Chip, Grid, Typography, useTheme } from "@material-ui/core";
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
  deathsInfiniteList,
  infiniteEventList,
  InfiniteEventListParams,
} from "../state/queries";

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

const InfiniteEventList: React.FC<EventListProps> = ({
  eventFilters,
  deathFilters,
  onClick,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <WithQueries
      queries={{
        events: infiniteEventList,
        deaths: deathsInfiniteList,
      }}
      params={{
        events: {
          ...eventFilters,
          page: currentPage,
        },
        deaths: {
          ...deathFilters,
          page: currentPage,
        },
      }}
      render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events, deaths }) => {
        const listRef = React.useRef<HTMLUListElement>(null);

        const theme = useTheme();

        const handleScroll = React.useCallback(
          debounce(500, false, async (): Promise<void> => {
            if (listRef.current) {
              const { scrollHeight, offsetTop } = listRef.current;

              const elBottom = scrollHeight + offsetTop;
              const windowBottom = window.scrollY + window.innerHeight;
              // console.log({
              //   elBottom,
              //   windowBottom,
              // });
              const deltaBottom = elBottom - windowBottom;

              // console.log({ deltaBottom });

              if (deltaBottom < 0) {
                const isLoading = currentPage * 20 > events.data.length;
                const allLoaded = events.total <= events.data.length;

                // console.log({
                //   isLoading,
                //   allLoaded,
                //   total: events.total,
                //   dataLength: events.data.length,
                // });
                if (!allLoaded && !isLoading) {
                  // console.log("bottom! yeah ", currentPage + 1);
                  setCurrentPage(currentPage + 1);
                }
              }
            }
          }),
          [currentPage, events.data.length]
        );

        React.useEffect(() => {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          window.addEventListener("scroll", handleScroll, { passive: true });

          return () => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            window.removeEventListener("scroll", handleScroll);
          };
        }, [currentPage, events.data.length]);

        const allEvents = React.useMemo(
          () => pipe([...events.data, ...deaths.data], A.sort(eventsSort)),
          [events.data.length, deaths.data.length]
        );

        return (
          <Box style={{ width: "100%" }}>
            <Grid container>
              <Grid container md={6} alignItems="center">
                <Typography variant="caption">
                  Nº Eventi:{" "}
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
              <Grid container md={6} justifyContent="flex-end">
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
                actors: Queries.Actor.getList,
                groups: Queries.Group.getList,
                keywords: Queries.Keyword.getList,
              }}
              params={{
                actors: {
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
              }}
              render={QR.fold(
                LazyFullSizeLoader,
                ErrorBox,
                ({ actors, groups, keywords }) => {
                  return (
                    <EventList
                      ref={listRef}
                      className="events"
                      style={{ width: "100%" }}
                      actors={actors.data}
                      groups={groups.data}
                      events={allEvents}
                      keywords={keywords.data}
                    />
                  );
                }
              )}
            />
          </Box>
        );
      })}
    />
  );
};

export default InfiniteEventList;
