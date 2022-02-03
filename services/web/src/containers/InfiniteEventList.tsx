import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
} from "@econnessione/shared/io/http";
import { SearchEvent } from "@econnessione/ui/components/lists/EventList/EventListItem";
import EventsTimeline from "@econnessione/ui/components/lists/EventList/EventTimeline";
import { SearchEventQueryResult } from "@econnessione/ui/state/queries/SearchEventsQuery";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { debounce } from "throttle-debounce";
import { InfiniteEventListParams } from "../state/queries";
import { doUpdateCurrentView } from "../utils/location.utils";

const eventsSort = pipe(
  Ord.reverse(D.Ord),
  Ord.contramap((e: SearchEvent): Date => {
    if (e.type === Events.ScientificStudy.ScientificStudyType.value) {
      return e.date;
    }
    if (e.type === Events.Death.DeathType.value) {
      return e.date;
    }
    return e.date;
  })
);

export interface EventListProps extends SearchEventQueryResult {
  hash: string;
  queryFilters: Omit<InfiniteEventListParams, "hash">;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
  };
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onBottomReached: () => void;
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
      {isLoading && props.loadedElements < props.totalElements ? (
        <CircularProgress />
      ) : props.loadedElements === props.totalElements ? (
        <Typography variant="h5">
          All {props.totalElements} events loaded.
        </Typography>
      ) : null}
    </div>
  );
};

const InfiniteEventList: React.FC<EventListProps> = ({
  hash,
  queryFilters,
  filters,
  events,
  totals,
  onBottomReached: onBottomReach,
  ...onClickProps
}) => {
  const allEvents = pipe(
    filters.uncategorized ? events : [],
    A.sort(eventsSort)
  );

  const totalEvents =
    totals.uncategorized + totals.deaths + totals.scientificStudies;

  return (
    <Box style={{ width: "100%" }}>
      <Box width="100%">
        <EventsTimeline
          className="events"
          style={{ width: "100%" }}
          events={allEvents}
          onClick={(e) => {
            if (e.type === "Death") {
              void doUpdateCurrentView({
                view: "actor",
                actorId: e.payload.victim.id,
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
      <BottomReach
        currentPage={queryFilters.page ?? 1}
        loadedElements={allEvents.length}
        totalElements={totalEvents}
        onBottomReach={onBottomReach}
      />
    </Box>
  );
};

export default React.memo(InfiniteEventList, (prevProps, nextProps) => {
  const prevPropsJ = JSON.stringify(prevProps);
  const nextPropsJ = JSON.stringify(nextProps);
  return prevPropsJ === nextPropsJ;
});

// export default InfiniteEventList;
