import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

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
    <Grid className="events" container style={{ width: "100%" }} spacing={2}>
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
            <Grid key={event.id} item sm={12} md={6}>
              <EventListItem
                event={event}
                actors={eventActors}
                groups={eventGroups}
                keywords={eventKeywords}
                onClick={onClick}
              />
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default EventList;
