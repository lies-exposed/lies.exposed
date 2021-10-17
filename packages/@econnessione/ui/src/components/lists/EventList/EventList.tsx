import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Box, List, ListItem } from "@material-ui/core";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Queries } from "../../../providers/DataProvider";
import { DeathListItem } from "./DeathListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

const eventsSort = pipe(
  Ord.contramap((e: Events.Event): Date => {
    if (e.type === "Death") {
      return e.date;
    }
    return e.startDate;
  })
)(D.Ord);

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  onClick,
  ...props
}) => {
  if (Events.Death.Death.is(e)) {
    return (
      <DeathListItem
        key={e.id}
        item={e}
        actors={props.actors}
        keywords={props.keywords}
        links={[]}
      />
    );
  }
  if (Events.Uncategorized.Uncategorized.is(e)) {
    return (
      <UncategorizedListItem
        key={e.id}
        item={e}
        actors={props.actors}
        groups={props.groups}
        keywords={props.keywords}
        links={e.links}
        onClick={onClick}
      />
    );
  }
  return <span>Not implemented</span>;
};

export interface EventListProps {
  eventFilters: Record<string, any>;
  deathFilters: Record<string, any>;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

let fetching = false;

const EventList: React.FC<EventListProps> = ({
  eventFilters,
  deathFilters,
  actors,
  groups,
  keywords,
  onClick,
}) => {
  const listRef = React.useRef<HTMLUListElement>(null);

  const [listEvents, setListEvents] = React.useState({
    data: [] as any[],
    total: 0,
    page: 0,
  });

  const fetchData = React.useCallback(() => {
    const page = listEvents.page + 1;

    return pipe(
      sequenceS(TE.ApplicativePar)({
        deaths: Queries.DeathEvent.getList.run({
          pagination: { page, perPage: 20 },
          sort: { field: "date", order: "DESC" },
          filter: {
            ...deathFilters,
          },
        }),
        events: Queries.Event.getList.run({
          pagination: { page, perPage: 20 },
          sort: { field: "startDate", order: "DESC" },
          filter: {
            ...eventFilters,
          },
        }),
      }),
      // eslint-disable-next-line array-callback-return
      TE.map(({ events, deaths }) => {
        const newEvents = pipe(
          [...events.data, ...deaths.data],
          A.sort(eventsSort)
        );
        setListEvents({
          data: [...listEvents.data, ...newEvents],
          total: events.total + deaths.total,
          page,
        });
      })
    )();
  }, [listEvents.page]);

  const handleScroll = async (): Promise<void> => {
    if (listRef.current) {
      const bottom = Math.ceil(window.scrollY) >= listRef.current.scrollHeight;
      if (bottom && listEvents.total >= listEvents.data.length && !fetching) {
        fetching = true;
        await fetchData();
        fetching = false;
      }
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener("scroll", handleScroll);
    };
  }, [listEvents.page]);

  return (
    <Box>
      <List ref={listRef} className="events" style={{ width: "100%" }}>
        {pipe(
          listEvents.data,
          A.map((event) => {
            const eventActors = Events.Uncategorized.Uncategorized.is(event)
              ? actors.filter((a) => event.actors.includes(a.id))
              : [];
            const eventGroups = Events.Uncategorized.Uncategorized.is(event)
              ? groups.filter((a) => event.groups.includes(a.id))
              : [];
            const eventKeywords = Events.Uncategorized.Uncategorized.is(event)
              ? keywords.filter((a) => event.keywords.includes(a.id))
              : [];
            return (
              <ListItem key={event.id}>
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
};

export default EventList;
