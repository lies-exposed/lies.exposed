import { Actor, Events, Group } from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  ...props
}) => {
  if (Events.Uncategorized.Uncategorized.is(e)) {
    return (
      <UncategorizedListItem
        key={e.id}
        item={e}
        actors={props.actors}
        groups={props.groups}
        topics={[]}
        links={e.links}
      />
    );
  }
  return <span>Not implemented</span>;
};

export interface EventListProps {
  events: Events.Event[];
  actors: Actor.Actor[];
  groups: Group.Group[];
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <Grid className="events" container style={{ width: "100%" }} spacing={2}>
      {pipe(
        props.events,
        A.map((event) => {
          const actors = Events.Uncategorized.Uncategorized.is(event)
            ? props.actors.filter((a) => event.actors.includes(a.id))
            : [];
          const groups = Events.Uncategorized.Uncategorized.is(event)
            ? props.groups.filter((a) => event.groups.includes(a.id))
            : [];
          return (
            <Grid key={event.id} item sm={12} md={6}>
              <EventListItem event={event} actors={actors} groups={groups} />
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default EventList;
