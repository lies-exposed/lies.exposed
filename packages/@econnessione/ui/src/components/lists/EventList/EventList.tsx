import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Box, List, ListItem } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { EventListItem } from "./EventListItem";

// const eventsSort = pipe(
//   Ord.contramap(
//     (e: Events.Event): Date => {
//       if (e.type === "Death") {
//         return e.date;
//       }
//       return e.startDate;
//     }
//   )
// )(D.Ord);

export interface EventListProps {
  events: Events.Event[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  actors,
  groups,
  keywords,
  onClick,
}) => {
  return (
    <Box style={{ width: "100%" }}>
      <List className="events" style={{ width: "100%" }}>
        {pipe(
          events,
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
};

export default EventList;
