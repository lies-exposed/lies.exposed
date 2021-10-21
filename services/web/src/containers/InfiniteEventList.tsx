import { Endpoints } from "@econnessione/shared/endpoints";
import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { EventListItem } from "@econnessione/ui/components/lists/EventList/EventListItem";
import {
  Box,
  Chip,
  List,
  ListItem,
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
import { infiniteEventList } from "../state/queries";

const eventsSort = pipe(
  Ord.contramap((e: Events.Event): Date => {
    if (e.type === "Death") {
      return e.date;
    }
    return e.startDate;
  })
)(D.Ord);

type QueryFilters<Q> = Omit<
  Partial<serializedType<Q>>,
  "_sort" | "_order" | "_end" | "_start"
>;

export interface EventListProps {
  eventFilters: QueryFilters<typeof Endpoints.Event.List.Input.Query>;
  deathFilters: QueryFilters<typeof Endpoints.DeathEvent.List.Input.Query>;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

const InfiniteEventList: React.FC<EventListProps> = ({
  eventFilters,
  deathFilters,
  actors,
  groups,
  keywords,
  onClick,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <WithQueries
      queries={{ events: infiniteEventList }}
      params={{
        events: {
          _start: (currentPage - 1) * 20,
          _end: 20,
          _sort: "startDate",
          _order: "DESC",
          ...eventFilters,
        } as any,
      }}
      render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events }) => {
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

        return (
          <Box style={{ width: "100%" }}>
            <Box display="flex">
              <Box>
                <Typography variant="caption">
                  Nº Eventi:{" "}
                  <Typography display="inline" variant="subtitle1">
                    {events.total}
                  </Typography>{" "}
                  dal {eventFilters.startDate} al {eventFilters.endDate}{" "}
                </Typography>
              </Box>
              <Box margin={1}>
                <Chip label={`Events (${events.total})`} />
              </Box>
              <Box margin={1}>
                <Chip
                  label={`Deaths (0)`}
                  style={{
                    backgroundColor: theme.palette.common.black,
                    color: theme.palette.common.white,
                  }}
                />
              </Box>
            </Box>

            <List ref={listRef} className="events" style={{ width: "100%" }}>
              {pipe(
                events.data,
                A.map((event) => {
                  const eventActors = Events.Uncategorized.Uncategorized.is(
                    event
                  )
                    ? actors.filter((a) => event.actors.includes(a.id))
                    : [];
                  const eventGroups = Events.Uncategorized.Uncategorized.is(
                    event
                  )
                    ? groups.filter((a) => event.groups.includes(a.id))
                    : [];
                  const eventKeywords = Events.Uncategorized.Uncategorized.is(
                    event
                  )
                    ? keywords.filter((a) => event.keywords.includes(a.id))
                    : [];
                  return (
                    <ListItem key={`event-list-item-${event.id}`}>
                      <EventListItem
                        event={event}
                        actors={eventActors}
                        groups={eventGroups}
                        keywords={eventKeywords}
                        onClick={onClick}
                      />
                    </ListItem>
                  );
                })
              )}
            </List>
          </Box>
        );
      })}
    />
  );
};

export default InfiniteEventList;
